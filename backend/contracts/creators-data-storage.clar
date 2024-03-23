
;; title: creators-data-storage
;; version: 1
;; summary: Stores the data for all creators on the platform.
;; description: This contract holds all the data for a creator platform where users can sign up and offer products and services.

;; traits

;; constants

(define-constant tier-1-product-listings-limit u10)
;;(define-constant tier-2-product-listings-limit u25)

;; Errors
(define-constant err-owner-only (err u100))
(define-constant err-creator-already-exists (err u101))
(define-constant err-creator-does-not-exist (err u102))
(define-constant err-no-value (err u103))
(define-constant err-beneficiary-only (err u104))
(define-constant err-unlock-height-not-reached (err u105))

;; data vars

(define-data-var contract-owner principal tx-sender)

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
        (ok (map-set creators user-address {name: display-name, description-hash: new-description-hash, products: (list ), tier: u1}))
    )
)

;; Update the profile of an existing creator.
(define-public (update-profile (user-address principal) (display-name (string-utf8 32)) (new-description-hash (buff 32)))
    (let
        (
            (profile (unwrap! (map-get? creators user-address) err-creator-does-not-exist))
        )
        (try! (is-contract-owner))
        (ok (map-set creators user-address {name: display-name, description-hash: new-description-hash, products: (get products profile), tier: (get tier profile)}))
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

;; private functions
;;

