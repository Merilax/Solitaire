class Card {
    number;
    suit;
    color;
    isFlipped;
    isInHiddenDeck;
    isInFlippedDeck;
    isInComplete;
    isCovered;
    isInBoard;
    inColumnIndex;
    referenceElement;
    referenceId;

    constructor(number, suit, referenceElement, isFlipped = false, isInHiddenDeck = true, isInComplete = false, isCovered = false, isInBoard = false, inColumnIndex = null) {
        this.number = number;
        this.suit = suit;
        this.referenceElement = referenceElement;
        this.referenceId = referenceElement.id;
        switch (suit) {
            case "spades":
                this.color = "black";
                break;
            case "hearts":
                this.color = "red";
                break;
            case "clubs":
                this.color = "black";
                break;
            case "diamonds":
                this.color = "red";
                break;
            default:
                throw new Error("Invalid card suit: " + suit);
        }
        this.isFlipped = isFlipped;
        this.isInHiddenDeck = isInHiddenDeck;
        this.isInFlippedDeck = !isInHiddenDeck
        this.isInComplete = isInComplete;
        this.isCovered = isCovered;
        this.isInBoard = isInBoard;
        this.inColumnIndex = inColumnIndex;
    };

    flip() {
        if (this.isInFlippedDeck) return;
        if (this.isInComplete) return;
        if (this.isCovered) return; // Must be set to false by external script before flipping, if covered beforehand.
        if (this.isInBoard && !this.isFlipped) return;

        this.isFlipped = !this.isFlipped;

        this.regenerateDiv(this.number, this.suit, this.isFlipped);

        // If in hidden deck, move to flipped deck.
        if (this.isInHiddenDeck) return this.moveToFlippedDeck();
    };

    moveToFlippedDeck() {
        this.isInHiddenDeck = false;
        this.isInFlippedDeck = true;
        this.isFlipped = false;

        deckFlippedDiv.appendChild(this.referenceElement);
        let toMove = deckHidden.pop();
        deckFlipped.push(toMove);
    }

    // Only to be called by main script upon resetting deck.
    moveToHiddenDeck(force) {
        if (force === false) {
            if (this.isInFlippedDeck === false) return; // Don't recall cards not on flipped deck.
        }

        this.isInFlippedDeck = false;
        this.isInHiddenDeck = true;
        this.isFlipped = true;

        this.regenerateDiv(this.number, this.suit, true)

        deckHiddenDiv.appendChild(this.referenceElement);
        let toMove = deckFlipped.pop();
        deckHidden.push(toMove);
    }

    regenerateDiv(number, suit, isFlipped) {
        let newCard = generateCardDiv(number, suit, isFlipped);
        this.referenceElement.replaceWith(newCard);
        this.referenceElement = newCard;
        this.referenceId = newCard.id;
        newCard.addEventListener("click", () => this.flip());
        newCard.addEventListener("dragstart", (event) => { event.dataTransfer.setData("CardDivId", event.target.id) });
    }
}