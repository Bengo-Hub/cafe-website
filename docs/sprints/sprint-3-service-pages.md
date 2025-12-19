# Sprint 3: Service & Feature Pages

**Duration**: 1 week  
**Status**: Not Started  
**Goal**: Build service pages, events, loyalty, contact, careers, and franchising pages

---

## Tasks

### 1. Services Page (`/services`)
- [x] Create page layout with service sections
- [x] Build "The Café" service card with description
- [x] Add "Service Training Center" section
- [x] Implement "Business Hub" section with amenities list
- [x] Create "Executive Accommodation" section
- [x] Add "Book Now" buttons (link to booking forms)
- [x] Display bookable spaces using dummy data
- [x] Create service icons/illustrations
- [x] Add pricing information
- [x] Implement testimonials for each service
- [x] Implement loading.tsx skeleton

### 2. Events Page (`/events`)
- [x] Create events calendar view
- [x] Build upcoming events section
- [x] Display event cards with images, dates, prices
- [x] Implement event category filters (weekly, special, holiday)
- [x] Create event detail modal
- [x] Add event booking form (dummy integration)
- [x] Show available slots counter
- [x] Add "Register" or "Book Now" CTA
- [x] Implement past events gallery
- [x] Implement loading.tsx skeleton with calendar
- [x] Add LoadingSpinner to booking form submission
- [x] Create monthly calendar component

### 3. Loyalty Program Page (`/loyalty`)
- [x] Create loyalty program overview section
- [x] Display program benefits list
- [x] Add points tiers (Bronze, Silver, Gold, Platinum)
- [x] Show tier benefits comparison table
- [x] Implement enrollment form (email signup)
- [x] Create rewards catalog section
- [x] Display points required for each reward
- [x] Add "How It Works" explainer
- [x] Show user points balance (if logged in)
- [x] Create progress bar to next reward

### 4. Contact Page (`/contact`)
- [x] Display contact information (phone, WhatsApp, email)
- [x] Embed location map (OpenStreetMap default)
- [x] Add Google Maps if API key is set
- [x] Show business hours
- [x] Create contact form (name, email, phone, message)
- [x] Add form validation with Zod
- [x] Implement form submission (dummy notification)
- [x] Show success message after submission
- [x] Implement loading.tsx skeleton
- [x] Add LoadingSpinner to form submission button
- [x] Add social media links
- [x] Display both Busia and future Kiambu locations

### 5. Careers Page (`/careers`)
- [x] Create "Why Work With Us" section
- [x] Display company culture and values
- [x] Build job listings using dummy job data
- [x] Add department filters (kitchen, service, management)
- [x] Create job card component (title, location, type)
- [x] Implement job detail view
- [x] Add application form (file upload for CV)
- [x] Show job requirements and responsibilities
- [x] Add "Apply Now" button
- [x] Implement form submission (dummy notification)

### 6. Franchising Page (`/franchising`)
- [x] Create "Why Franchise with Urban Loft" hero
- [x] Display franchise benefits list
- [x] Add icons for each benefit
- [x] Create "Our Success Stories" section
- [x] Show franchise requirements
- [x] Display investment information (ranges)
- [x] Add franchise inquiry form
- [x] Implement multi-step form (contact info, location interest, investment capacity)
- [x] Show franchise support services
- [x] Add downloadable franchise brochure (PDF)

### 7. Forms & Validation
- [ ] Setup React Hook Form
- [ ] Configure Zod validation schemas
- [ ] Create reusable form components
- [ ] Implement field validation messages
- [ ] Add loading states during submission
- [ ] Show success/error notifications
- [ ] Implement CAPTCHA (optional)
- [ ] Add file upload component for CV/documents

### 8. Map Integration
- [ ] Install react-leaflet for OpenStreetMap
- [ ] Create Map component with marker
- [ ] Add Google Maps fallback if API key exists
- [ ] Implement map provider detection
- [ ] Show Busia location by default
- [ ] Add zoom and pan controls
- [ ] Style map to match brand colors

### 9. Components
- [ ] Create ServiceCard component
- [ ] Build EventCard component
- [ ] Implement CalendarView component
- [ ] Create RewardCard component
- [ ] Build ContactForm component
- [ ] Implement JobCard component
- [ ] Create ApplicationForm component
- [ ] Build InquiryForm component
- [ ] Create Map component
- [ ] Implement FileUpload component

### 10. Data Integration
- [ ] Use dummy events data
- [ ] Use dummy spaces data
- [ ] Use dummy loyalty data
- [ ] Use dummy jobs data
- [ ] Implement form submission to notifications-service (dummy)
- [ ] Add loading states for all forms
- [ ] Handle validation errors

### 11. SEO & Meta Tags
- [ ] Add page-specific meta tags
- [ ] Implement Event schema for events page
- [ ] Add JobPosting schema for careers
- [ ] Configure Open Graph images
- [ ] Add breadcrumb navigation

### 12. Testing
- [ ] Test all forms with valid/invalid data
- [ ] Test file upload functionality
- [ ] Verify map loading and interaction
- [ ] Test calendar navigation
- [ ] Write E2E tests for form submissions
- [ ] Test responsive layouts on all pages

---

## Definition of Done
- [x] All six pages created and functional
- [x] Forms validate correctly and show errors
- [x] Map displays correct location
- [x] Events display with filtering
- [x] All forms submit successfully (dummy integration)
- [x] Pages are responsive on all devices
- [x] Loading and error states implemented
- [x] SEO meta tags added to all pages
- [x] Code passes linting
- [x] All components have TypeScript types

---

## Dependencies
- Sprint 2 completed
- React Hook Form installed
- Zod validation library
- React Leaflet (or Google Maps SDK)
- Dummy data for events, spaces, jobs
- Notification service integration (dummy)

---

## Notes
- Forms should use dummy integrations until services are ready
- Store form submissions in console.log for now
- Maps should prefer OpenStreetMap (free) but support Google Maps if API key set
- All pages should follow brand guidelines
- Ensure accessibility on all forms (labels, ARIA)

---

## Related Documents
- [Plan.md](../plan.md)
- [DUMMY-DATA.md](../DUMMY-DATA.md)
- [SERVICE-DEPENDENCIES.md](../SERVICE-DEPENDENCIES.md)
- [Sprint 2](./sprint-2-core-pages.md)
