# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-02-03

### Added

- Kit UI v2 migration
- User search on-demand for better performance and privacy

### Fixed

- Shared boards display in left menu
- XSS vulnerability from react-photoswipe-gallery
- User emails now masked on public boards when not logged in
- Node upgrade issues
- Attachment popup removed
- ESLint config extending from another package.json

### Changed

- Removed pnpm in favor of npm for simplicity
- Aligned node versions across environments
- Cleaned up package-lock.json and added async overrides

## [1.0.1] - 2025-11-25

### Added

- ✨ (frontend) add no member/label option in filters

### Fixed

- 💄 (frontend) Improve filters UI
- 🐛(frontend) Switched to pointer collision strategy
- 🐛 (header) fix posthog identification by using window.posthog
- ✨ (frontend) add i18n support to Cunningham

### Changed

- 📝 Update README
