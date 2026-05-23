// Package storage wraps S3 object storage for profile images, porting
// services/aws from the Node backend.
package storage

import (
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"

	"statvio/backend/internal/config"
)

// S3 uploads and deletes objects in the configured bucket.
type S3 struct {
	client   *s3.Client
	uploader *manager.Uploader
	bucket   string
	region   string
}

// New builds an S3 client from static credentials.
func New(cfg config.AWSConfig) *S3 {
	awsCfg := aws.Config{
		Region:      cfg.Region,
		Credentials: credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
	}
	client := s3.NewFromConfig(awsCfg)
	return &S3{
		client:   client,
		uploader: manager.NewUploader(client),
		bucket:   cfg.BucketName,
		region:   cfg.Region,
	}
}

// Upload streams a file to S3 under a key of the form `{userID}-{uuid}.{ext}`
// and returns the stored key and its public URL.
func (s *S3) Upload(ctx context.Context, userID, originalName, contentType string, body io.Reader) (key, fileURL string, err error) {
	ext := extension(originalName)
	key = fmt.Sprintf("%s-%s.%s", userID, uuid.NewString(), ext)

	out, err := s.uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        body,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", "", err
	}

	fileURL = out.Location
	if fileURL == "" {
		fileURL = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)
	}
	return key, fileURL, nil
}

// Delete removes an object by key.
func (s *S3) Delete(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	return err
}

func extension(name string) string {
	if i := strings.LastIndex(name, "."); i >= 0 && i < len(name)-1 {
		return name[i+1:]
	}
	return ""
}
