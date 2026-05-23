import { Link } from "react-router-dom"

// Footer holds the legal/contact links and copyright line.
export function Footer() {
  return (
    <footer className="text-muted-foreground border-t py-8 text-center text-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy &amp; Policy
          </Link>
          <Link to="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
          <Link to="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
        </div>
        <div>© {new Date().getFullYear()} Statvio. All rights reserved.</div>
      </div>
    </footer>
  )
}

export default Footer
