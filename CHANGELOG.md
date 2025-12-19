# Changelog

All notable changes to the Urban Loft Cafe website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Sprint 3: Service and feature pages (Services Hub, Events, Contact)
- Sprint 4: Authentication and order tracking
- Sprint 5: PWA features and production polish
- Unit tests for all components
- E2E tests for critical user flows
- Performance optimization and Core Web Vitals measurement
- Accessibility testing and WCAG AA compliance verification

## [0.2.2] - 2025-12-19

### Added
- **Magical Hero Carousel**: Implemented `HeroCarousel` with Framer Motion `AnimatePresence` for smooth image transitions and animated text overlays.
- **Testimonials Section**: Added a dedicated community feedback section to the landing page with star ratings and customer avatars.
- **Missing Core Pages**: Fully implemented `Contact`, `Services`, and `Events` pages with hero sections and interactive content.
- **Contact Form**: Added a functional contact form with validation and success feedback.

### Changed
- **Branding Overhaul**: Significantly increased logo size in both `Header` and `Footer` to enhance brand visibility.
- **Landing Page Polish**: 
  - Enhanced `Events` section with background image overlays and improved typography.
  - Styled `Newsletter` section with glassmorphism effects and background SVG.
  - Updated `Menu` page hero with high-quality background image and dark overlay for better readability.
- **Asset Alignment**: Audited and linked all images to high-quality assets in `public/images/` (Pizza Friday, Couples Night, etc.).

### Fixed
- **Build Stability**: Resolved syntax errors in `page.tsx` and type errors in `events/page.tsx` and `ServiceCard.tsx`.
- **Route Consistency**: Fixed 404 errors for `/services/hub`, `/services/events`, and `/sw.js`.

## [0.2.1] - 2025-12-19

### Changed
- Upgraded `HeroSection` to an autoplay carousel with next/prev controls, indicators, and improved accessibility. Defaults to images from `public/images/hero`.
- Maintains backward compatibility: `backgroundImage` still supported for single-slide hero.

### Fixed
- Completed image audit and corrected dummy menu image paths to existing assets under `public/images/menu` to prevent broken images.

## [0.2.0] - 2025-12-19

### Added - Sprint 2 Complete ✓
- **Home Page**: Full implementation with hero, services, menu highlights, events, testimonials, newsletter
- **About Page**: Story, timeline, values, vision, team sections with animations
- **Menu Page**: Complete menu browsing with category filters, search, sorting, and item modal
- **SEO Optimization**: 
  - sitemap.xml and robots.txt generation
  - Comprehensive metadata (Open Graph, Twitter Cards)
  - JSON-LD structured data (LocalBusiness, Organization, Menu schemas)
  - SEO utility functions for schema generation
- **Sprint 2 Components**: 
  - HeroSection with background image and CTAs
  - ServiceCard with features and hover effects
  - MenuItemCard with dietary tags and availability
  - MenuItemModal with detailed item view
  - CategoryFilter for menu filtering
  - SearchBar with clear functionality
  - TeamMemberCard with social links
  - ValueCard for company values
- **Image Assets**: SVG icons (coffee, briefcase, calendar, wifi, users, heart, star, award, leaf, map-pin)
- **Image Placeholders**: Hero, menu, events, team SVG placeholders

### Changed
- Enhanced root layout metadata with comprehensive SEO tags
- Updated dummy data types to match actual usage patterns
- Improved TypeScript type safety across components
- All pages now using Next.js Image component for optimization

### Fixed
- TypeScript errors in MenuItem interface (tags → dietaryTags)
- TeamMember interface property names (position → role)
- Event interface compatibility with dummy data
- Build errors and linting warnings

## [0.1.0] - 2025-12-18

### Added
- Initial project structure
- Documentation files (README, CONTRIBUTING, etc.)
- Sprint planning documents
- Service dependency analysis
- Dummy data structures
- Git repository initialization
- Next.js 15 project with TypeScript
- Tailwind CSS configuration with Urban Loft branding
- Complete UI component library (Button, Card, Input, Badge, LoadingSpinner)
- Responsive Header and Footer components
- Utility functions (API client, formatters, helpers)
- Type definitions for all entities
- Testing setup (Jest + Playwright)
- All dummy data implemented (menu, events, spaces, team, orders, loyalty, jobs)

### Documentation
- Implementation plan (plan.md)
- Service dependencies analysis
- Dummy data specifications
- Sprint 1-5 detailed task lists
- Standard Git files (.gitignore, CONTRIBUTING.md, etc.)

---

## Version History

### Version Format
- **Major.Minor.Patch** (e.g., 1.2.3)
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Change Categories
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes

---

## Future Releases

### v0.2.0 - Sprint 1 Complete
- Next.js 15 project setup
- Tailwind CSS configuration
- Basic layout components
- Dummy data implementation
- Environment configuration

### v0.3.0 - Sprint 2 Complete
- Home page
- About page
- Menu page with filtering
- SEO optimization
- Responsive design

### v0.4.0 - Sprint 3 Complete
- Services page
- Events page
- Loyalty program page
- Contact page
- Careers page
- Franchising page

### v0.5.0 - Sprint 4 Complete
- SSO authentication
- Order tracking
- Real-time maps integration
- WebSocket support

### v1.0.0 - Production Release
- PWA implementation
- Full SEO optimization
- Production deployment
- Performance optimization
- All features complete

---

[Unreleased]: https://github.com/bengobox/cafe-website/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/bengobox/cafe-website/releases/tag/v0.1.0
