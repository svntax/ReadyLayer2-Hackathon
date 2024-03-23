
;; title: creators-data-storage
;; version: 1
;; summary: Stores the data for all creators on the platform.
;; description: This contract holds all the data for a creator platform where users can sign up and offer products and services.

;; traits

;; constants

(define-constant tier-1-creator u1)

;; Errors
(define-constant err-owner-only (err u100))
(define-constant err-creator-already-exists (err u101))
(define-constant err-creator-does-not-exist (err u102))
(define-constant err-product-listings-capacity-exceeded (err u103))
(define-constant err-index-out-of-bounds (err u104))
(define-constant err-product-does-not-exist (err u105))
(define-constant err-product-does-not-belong-to-creator (err u106))

;; data vars

(define-data-var contract-owner principal tx-sender)
(define-data-var products-nonce uint u0)
(define-data-var tier-1-product-listings-limit uint u10)
;;(define-data-var tier-2-product-listings-limit uint u25)

;; data maps

;; Creators have a display name and description.
(define-map creators
    principal
    {
        name: (string-utf8 32),
        description-hash: (buff 32),
        products: (list 10 uint),
        tier: uint
    }
)

;; Products are added by creators and contain data about the product info.
(define-map products
    uint
    {
      creator: principal,
      price: uint,
      amount-sold: uint,
      data-hash: (buff 32)
    }
)

;; public functions

;; Change the owner of this contract. Source: https://book.clarity-lang.org/ch13-03-contract-upgradability.html
(define-public (set-contract-owner (new-owner principal))
    (begin
        (try! (is-contract-owner))
        (ok (var-set contract-owner new-owner))
    )
)

;; Create a new profile for a creator.
(define-public (create-profile (user-address principal) (display-name (string-utf8 32)) (new-description-hash (buff 32)))
    (begin
        (try! (is-contract-owner))
        (asserts! (is-none (map-get? creators user-address)) err-creator-already-exists)
        (ok (map-set creators user-address
            {
                name: display-name,
                description-hash: new-description-hash,
                products: (list ),
                tier: tier-1-creator
            }
        ))
    )
)

;; Update the profile of an existing creator.
(define-public (update-profile (user-address principal) (display-name (string-utf8 32)) (new-description-hash (buff 32)))
    (let
        (
            (profile (unwrap! (map-get? creators user-address) err-creator-does-not-exist))
        )
        (try! (is-contract-owner))
        (ok (map-set creators user-address (merge profile 
            {
                name: display-name,
                description-hash: new-description-hash
            }
        )))
    )
)

;; Create a new product for a creator.
(define-public (create-product (creator-address principal) (new-price uint) (new-data-hash (buff 32)))
    (let
        (
            (creator-profile (unwrap! (get-creator creator-address) err-creator-does-not-exist))
            (creator-products (unwrap! (get-creator-products creator-address) err-creator-does-not-exist))
            (product-id (+ (var-get products-nonce) u1))
            (num-products (len (filter is-non-zero creator-products)))
        )
        (try! (is-contract-owner))
        ;; Assert that the creator's product listings has not exceeded the maximum capacity
        (asserts! (< num-products (var-get tier-1-product-listings-limit)) err-product-listings-capacity-exceeded)
        ;; Add the product to the products map
        (map-set products product-id
            {
                creator: creator-address,
                price: new-price,
                amount-sold: u0,
                data-hash: new-data-hash
            }
        )
        ;; Then add the product to the creator's list of products
        (map-set creators creator-address (merge creator-profile
            {
                ;; NOTE: See https://github.com/stacks-network/stacks-core/issues/3562, issue with using data variable for max_length in as-max-len
                products: (unwrap! (as-max-len? (append creator-products product-id) u10) err-index-out-of-bounds)
            }
        ))
        (var-set products-nonce product-id)
        (ok product-id)
    )
)

;; Update the given product's price and/or info.
(define-public (update-product (creator-address principal) (product-id uint) (new-price uint) (new-data-hash (buff 32)))
    (let
        (
            (creator-products (unwrap! (get-creator-products creator-address) err-creator-does-not-exist))
            (product (unwrap! (get-product product-id) err-product-does-not-exist))
        )
        (try! (is-contract-owner))
        ;; Assert that the product id being changed belongs to the given creator.
        (asserts! (is-some (index-of? creator-products product-id)) err-product-does-not-belong-to-creator)
        ;; TODO: Should the amount sold be reset? If the product is significantly changed, it can be misleading if the amount sold is kept.
        (ok (map-set products product-id (merge product
            {
                price: new-price,
                data-hash: new-data-hash
            }
        )))
    )
)

;; Remove a product for a creator.
(define-public (remove-product (creator-address principal) (product-id uint))
    (let
        (
            (creator-profile (unwrap! (get-creator creator-address) err-creator-does-not-exist))
            (creator-products (unwrap! (get-creator-products creator-address) err-creator-does-not-exist))
            (product (unwrap! (get-product product-id) err-product-does-not-exist))
            (product-index (unwrap! (index-of? creator-products product-id) err-product-does-not-belong-to-creator))
        )
        (try! (is-contract-owner))
        (map-delete products product-id)
        ;; Then remove the product id from the creator's list of products
        (ok (map-set creators creator-address (merge creator-profile
            {
                ;; NOTE: Not sure if this is an efficient way of removing from a list.
                products: (filter is-non-zero (unwrap! (replace-at? creator-products product-index u0) err-index-out-of-bounds))
            }
        )))
    )
)

;; read only functions

(define-read-only (is-contract-owner)
    (ok (asserts! (is-eq contract-caller (var-get contract-owner)) err-owner-only))
)

(define-read-only (get-contract-owner)
    (ok (var-get contract-owner))
)

(define-read-only (get-creator (address principal))
    (map-get? creators address)
)
(define-read-only (get-creator-tier (address principal))
    (get tier (map-get? creators address))
)

(define-read-only (get-creator-products (address principal))
    (get products (map-get? creators address))
)

(define-read-only (get-product (product-id uint))
    (map-get? products product-id)
)

;; private functions

(define-private (is-non-zero (value uint))
    (not (is-eq value u0))
)