# catalog-media Specification

## Purpose

Product photos: validation, URL+metadata storage, ordering, and optimized delivery. No binary blobs in DB.

## Requirements

### Requirement: Photo Validation

The system SHALL accept only MIME `image/jpeg`, `image/png`, `image/webp` (and extensions jpg/jpeg/png/webp) and file size <=5MB; otherwise it MUST reject with 400 and a descriptive error.

#### Scenario: Valid webp accepted

- GIVEN admin uploads `image/webp` 2MB
- WHEN POST `/api/v1/products/:id/images`
- THEN 201 with image metadata

#### Scenario: Bad MIME rejected

- GIVEN admin uploads `image/gif` or `application/pdf`
- WHEN upload is sent
- THEN 400 with `Unsupported media type`

#### Scenario: Oversize rejected

- GIVEN admin uploads 6MB jpg
- WHEN upload is sent
- THEN 400 with `File too large`

### Requirement: URL and Metadata Storage

The system SHALL persist `ProductImage` with `productId`, `url` (string, http/https), `mimeType`, `sizeBytes`, `width`, `height`, `sortOrder`; it MUST NOT store binary blobs in Postgres.

#### Scenario: Persist metadata

- GIVEN a valid upload processed
- WHEN image is saved
- THEN DB row contains url + mimeType + sizeBytes + dimensions and no `bytea` column

#### Scenario: URL required

- GIVEN payload without `url`
- WHEN creating image record
- THEN 400 validation error

### Requirement: Active Flag and SortOrder

The system SHALL support `isActive` toggle per image and `sortOrder` ordering; customer queries MUST return only `isActive=true` images ordered by `sortOrder ASC`.

#### Scenario: Customer sees active ordered images

- GIVEN product has 3 images (sort 2 active, sort 1 inactive, sort 0 active)
- WHEN customer fetches product detail
- THEN images returned are 2 active sorted ASC (sort 0 then 2)

#### Scenario: Admin toggles visibility

- GIVEN admin PATCH `isActive=false` on image
- WHEN customer fetches product
- THEN image no longer appears

### Requirement: Image Optimization

The system SHOULD resize/compress via `sharp` or `next/image` on serve; original URL remains source, optimized delivery MUST preserve aspect ratio and not exceed original dimensions unless explicitly requested.

#### Scenario: Optimized delivery

- GIVEN image url 2000px wide
- WHEN client requests via `next/image` with width 800
- THEN response is optimized/compressed variant

## Non-goals

- Storage provider selection, CDN config, user-generated reviews, video media.

## Dependencies

- `product-catalog`, `persistence-foundation`, `api-skeleton`.

## Success Criteria

- Invalid MIME/size →400; DB holds url+metadata not blob; customer sees active ordered images; `next/image` or sharp optimization active.
