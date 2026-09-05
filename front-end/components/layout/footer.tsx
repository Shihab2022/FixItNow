import Link from "next/link";
import {
  FaLinkedin,
  FaSquareInstagram,
  FaTwitter,
  FaFacebook,
} from "react-icons/fa6";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="  text-black">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span>FixItNow</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              Your trusted home service marketplace. Connecting verified
              professionals with homeowners in minutes.
            </p>
            <div className="mt-6 flex gap-4 text-slate-400">
              <a
                href="#"
                className="transition hover:text-white"
                aria-label="Twitter"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="transition hover:text-white"
                aria-label="Facebook"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="transition hover:text-white"
                aria-label="Instagram"
              >
                <FaSquareInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="transition hover:text-white"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/support" className="transition hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="transition hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-white">
                  Browse Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Top Services</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/services" className="transition hover:text-white">
                  All Services
                </Link>
              </li>
              <li>
                <Link href="/technicians" className="transition hover:text-white">
                  Find Technicians
                </Link>
              </li>
              <li>
                <Link href="/map" className="transition hover:text-white">
                  Nearby Map
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="transition hover:text-white">
                  Task Marketplace
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Support</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/support" className="transition hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support" className="transition hover:text-white">
                  Safety Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FixItNow Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
