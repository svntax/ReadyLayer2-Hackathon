
;; title: creators-platform
;; version: 1
;; summary: The contract that users interact with to participate in the creator platform.
;; description: This contract manages a DeFi platform where users can sign up as creators and offer products to sell.

;; traits
;; NOTE: Commented-out function definitions are giving an "invalid signature for method ... regarding trait's specification" error for some reason, when running tests
(define-trait creators-data-storage-trait
    (
        ;;(is-contract-owner (principal) (response bool uint))
        (get-contract-owner () (response principal uint))
        (set-contract-owner (principal) (response bool uint))
        (create-profile (principal (string-utf8 32) (buff 32)) (response bool uint))
        (update-profile (principal (string-utf8 32) (buff 32)) (response bool uint))
        ;;(get-creator (principal) (response (optional {name: uint, description-hash: (buff 32), products: (list 10 uint), tier: uint}) uint))
        ;;(get-creator-tier (principal) (response uint uint))
        ;;(get-creator-products (principal) (response (list 10 uint) uint))
        ;;(get-product (uint) (response (optional {creator: principal, price: uint, amount-sold: uint, data-hash: (buff 32)}) uint))
        (create-product (principal uint (buff 32)) (response uint uint))
        (update-product (principal uint uint (buff 32)) (response bool uint))
        (remove-product (principal uint) (response bool uint))
    )
)

;; constants

;; Errors
(define-constant err-invalid-creators-data-storage-reference (err u200))

;; data vars

(define-data-var creators-data-storage-principal principal .creators-data-storage)

;; data maps
;;

;; public functions

;; Create a new profile for the sender.
(define-public (create-profile (display-name (string-utf8 32)) (new-description-hash (buff 32)) (creators-data-storage-ref <creators-data-storage-trait>))
    (begin 
        (asserts! (is-eq (contract-of creators-data-storage-ref) (var-get creators-data-storage-principal)) err-invalid-creators-data-storage-reference)
        (contract-call? creators-data-storage-ref create-profile tx-sender display-name new-description-hash)
    )
)

;; Update the profile for the sender.
(define-public (update-profile (display-name (string-utf8 32)) (new-description-hash (buff 32)) (creators-data-storage-ref <creators-data-storage-trait>))
    (begin 
        (asserts! (is-eq (contract-of creators-data-storage-ref) (var-get creators-data-storage-principal)) err-invalid-creators-data-storage-reference)
        (contract-call? creators-data-storage-ref update-profile tx-sender display-name new-description-hash)
    )
)

;; Create a new product for the sender.
(define-public (create-product (new-price uint) (new-data-hash (buff 32)) (creators-data-storage-ref <creators-data-storage-trait>))
    (begin 
        (asserts! (is-eq (contract-of creators-data-storage-ref) (var-get creators-data-storage-principal)) err-invalid-creators-data-storage-reference)
        (contract-call? creators-data-storage-ref create-product tx-sender new-price new-data-hash)
    )
)

;; Update the given product for the sender.
(define-public (update-product (product-id uint) (new-price uint) (new-data-hash (buff 32)) (creators-data-storage-ref <creators-data-storage-trait>))
    (begin 
        (asserts! (is-eq (contract-of creators-data-storage-ref) (var-get creators-data-storage-principal)) err-invalid-creators-data-storage-reference)
        (contract-call? creators-data-storage-ref update-product tx-sender product-id new-price new-data-hash)
    )
)

;; Remove the given product for the sender.
(define-public (remove-product (product-id uint) (creators-data-storage-ref <creators-data-storage-trait>))
    (begin 
        (asserts! (is-eq (contract-of creators-data-storage-ref) (var-get creators-data-storage-principal)) err-invalid-creators-data-storage-reference)
        (contract-call? creators-data-storage-ref remove-product tx-sender product-id)
    )
)

;; read only functions
;;

;; private functions
;;

;; Immediately set the contract owner of the data storage contract to this contract.
(contract-call? .creators-data-storage set-contract-owner (as-contract tx-sender))