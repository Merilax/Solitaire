const deckHidden = [];
const deckFlipped = [];
const deckBoard = [];
const boardArray = [];
const completeArray = [];

const deckHiddenDiv = document.getElementById("deckHidden");
const deckFlippedDiv = document.getElementById("deckFlipped");
const deckResetBtn = document.getElementById("resetDeck");
deckResetBtn.addEventListener("click", () => resetDeck());

document.body.onload = generateGame();

function generateGame() {
    genereteCompleteSlots();
    generateColumns();
    generateDeck();
    fillColumnds();
}

function genereteCompleteSlots() {
    let slots = document.getElementsByClassName("completeSlot");
    for (let i = 0; i < slots.length; i++) {
        completeArray.push([]);
        const elem = slots.item(i);
        elem.addEventListener("dragover", (event) => allowDrop(event));
        elem.addEventListener("drop", (event) => dropToComplete(event, elem));
    };
}

function generateColumns() {
    let lowerContainer = document.getElementById("lowerContainer");
    for (let i = 0; i < 7; i++) {
        boardArray.push([]);
        let column = document.createElement("div");
        column.classList.add("column");
        column.id = "column-" + i;
        lowerContainer.appendChild(column);
        column.addEventListener("dragover", (event) => allowDrop(event));
        column.addEventListener("drop", (event) => dropToColumn(event, column));
    }
}

function generateDeck() {
    // Suit loop
    let suit;
    for (let i = 0; i < 4; i++) {
        switch (i) {
            case 0:
                suit = "spades";
                break;
            case 1:
                suit = "hearts";
                break;
            case 2:
                suit = "clubs";
                break;
            case 3:
                suit = "diamonds";
                break;
        }
        // Number loop
        for (let j = 1; j < 14; j++) {
            let cardDiv = generateCardDiv(j, suit, true);
            let card = new Card(j, suit, cardDiv, true, true, false);
            cardDiv.addEventListener("click", () => card.flip());
            cardDiv.addEventListener("dragstart", (event) => { event.dataTransfer.setData("CardDivId", event.target.id) });

            deckHidden.push(card);
            shuffleDeck();
        }
    }

    deckHidden.forEach((card) => deckHiddenDiv.appendChild(card.referenceElement));
}

function generateCardDiv(number, suit, isFlipped) {
    let newcardDiv = document.createElement("div");
    newcardDiv.classList.add("card");
    newcardDiv.style.position = "absolute";
    newcardDiv.draggable = true;

    if (!isFlipped) {
        newcardDiv.id = `${suit.charAt(0).toUpperCase()}${number}`; // Unused

        let suitIcon = document.createElement("img");
        let span = document.createElement("span");

        let color;
        switch (suit) {
            case "spades":
                color = "black";
                suitIcon.src = "./media/spade-suit.svg";
                break;
            case "hearts":
                color = "red";
                suitIcon.src = "./media/heart-suit.svg";
                break;
            case "clubs":
                color = "black";
                suitIcon.src = "./media/club-suit.svg";
                break;
            case "diamonds":
                color = "red";
                suitIcon.src = "./media/diamond-suit.svg";
                break;
        }
        let mark = number;
        switch (number) {
            case 1:
                mark = 'A';
                break;
            case 11:
                mark = 'J';
                break;
            case 12:
                mark = 'Q';
                break;
            case 13:
                mark = 'K';
                break;
        }
        span.textContent = mark;
        span.style.color = color;

        let suitContainerUp = document.createElement("div");
        suitContainerUp.classList.add("suitContainerUp", "suitContainer");
        let suitContainerDown = document.createElement("div");
        suitContainerDown.classList.add("suitContainerDown", "suitContainer");

        suitContainerUp.appendChild(span);
        suitContainerUp.appendChild(suitIcon);
        suitContainerDown.appendChild(span.cloneNode(true));
        suitContainerDown.appendChild(suitIcon.cloneNode(true));

        newcardDiv.appendChild(suitContainerUp);
        newcardDiv.appendChild(suitContainerDown);
    } else {
        newcardDiv.classList.add("flipped");
    }

    return newcardDiv;
}

function shuffleDeck() {
    let currentIndex = deckHidden.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        let temp = deckHidden[currentIndex];
        deckHidden[currentIndex] = deckHidden[randomIndex];
        deckHidden[randomIndex] = temp;
    }
}

function fillColumnds() {
    for (let i = 0; i < 7; i++) {
        // Fill one more card per column, starting at 1.
        for (let j = 0; j < i + 1; j++) {
            let card = deckHidden.pop();
            card.isInHiddenDeck = false;
            card.isFlipped = true;

            //document.getElementById("column-" + i).appendChild(card.referenceElement);
            if (j === i) {
                card.flip();
            } else {
                card.isCovered = true;
            }
            moveToColumn(card, document.getElementById("column-" + i));
        }
    }
}

function resetDeck() {
    if (deckHidden.length > 0) return false;

    for (let i = deckFlipped.length - 1; i >= 0; i--) {
        let card = deckFlipped[i];
        card.moveToHiddenDeck(false);
    }
    return true;
}

function dropToColumn(event) {
    // Don't drop a card into another card.
    let elements = document.elementsFromPoint(event.clientX, event.clientY);
    let target = elements.filter(e => e.classList.contains("column"))[0];
    if (!target) return;

    const cardDivId = event.dataTransfer.getData("CardDivId");
    const columnIndex = target.id.slice(7);

    let card = deckFlipped.filter((card) => card.referenceElement === document.getElementById(cardDivId))[0];

    if (!card) {// Not manual
        console.log(deckBoard.map((cardMap => cardMap.referenceElement.id)).join(','));
        card = deckBoard.filter((card) => card.referenceElement === document.getElementById(cardDivId))[0];
        console.log("Grabbed from deckBoard");
    }
    if (!card) return;
    console.log(card);
    card.isInHiddenDeck = false
    card.isInFlippedDeck = false;
    card.isInComplete = false;

    if (checkColumnPlacing(card, columnIndex)) {
        event.preventDefault();

        moveToColumn(card, target);

        return true;
    }
}

function dropToComplete(event) {
    let elements = document.elementsFromPoint(event.clientX, event.clientY);
    let target = elements.filter(e => e.classList.contains("completeSlot"))[0];
    if (!target) return;

    const cardDivId = event.dataTransfer.getData("CardDivId");
    const slotIndex = target.id.slice(12);

    let card = deckFlipped.filter((card) => card.referenceId === cardDivId)[0];
    if (!card) card = deckBoard.filter((card) => card.referenceId === cardDivId)[0];

    card.isInHiddenDeck = false
    card.isInFlippedDeck = false;

    if (checkCompletePlacing(card, parseInt(slotIndex))) {
        event.preventDefault();

        moveToComplete(card, target);

        return true;
    }
}

function moveToColumn(card, column) {
    const columnIndex = column.id.slice(7);

    //console.log(deckBoard);

    if (card.isInBoard) {
        let previousIndex = parseInt(card.inColumnIndex);
        let cardIndex = boardArray[previousIndex].findIndex((thisCard) => thisCard === card);
        let moveStack = boardArray[previousIndex].splice(cardIndex);

        moveStack.forEach(movedCard => {
            movedCard.referenceElement.style.marginTop = `${(boardArray[columnIndex].length) * 27}px`;
            boardArray[columnIndex].push(movedCard);
            //movedCard.isInBoard = true;
            movedCard.inColumnIndex = columnIndex;
            column.appendChild(movedCard.referenceElement);
        });

        let uncoveredCard = boardArray[previousIndex][boardArray[previousIndex].length - 1];
        if (uncoveredCard) {
            uncoveredCard.isCovered = false;
            uncoveredCard.flip();
            uncoveredCard.referenceElement.style.marginTop = `${(boardArray[previousIndex].length - 1) * 27}px`;
        }
    } else {
        card.referenceElement.style.marginTop = `${boardArray[columnIndex].length * 27}px`;
        deckBoard.push(card);
        boardArray[columnIndex].push(card);
        card.isInBoard = true;
        card.inColumnIndex = columnIndex;
        column.appendChild(card.referenceElement);
    }
}

function moveToComplete(card, slot) {
    const slotIndex = parseInt(slot.id.slice(12));

    if (card.isInBoard) {
        let previousIndex = card.inColumnIndex;
        boardArray[previousIndex].pop();
        let deckIndex = deckBoard.findIndex((thisCard => thisCard === card));
        // Find deck index of card
        deckBoard.splice(deckIndex, 1);

        completeArray[slotIndex].push(card);
        card.isInBoard = false;
        card.inColumnIndex = null;
        slot.appendChild(card.referenceElement);

        let uncoveredCard = boardArray[previousIndex][boardArray[previousIndex].length - 1];
        if (uncoveredCard) {
            uncoveredCard.isCovered = false;
            uncoveredCard.flip();
            uncoveredCard.referenceElement.style.marginTop = `${(boardArray[previousIndex].length - 1) * 27}px`;
        }
    } else {
        completeArray[slotIndex].push(card);
        card.isInBoard = false;
        card.inColumnIndex = null;
        slot.appendChild(card.referenceElement);
    }
    card.referenceElement.style.marginTop = `0px`;

    console.log(deckBoard);
    checkWin();
}

function allowDrop(event) {
    event.preventDefault();
}

function checkColumnPlacing(card, i) {
    if (card.isFlipped) return false;

    let lastCard = boardArray[i][boardArray[i].length - 1];

    if (!lastCard && card.referenceId.slice(1) === "13") return true; // Drop on empty column if King.
    // Must ensure lastcard exists for later checks.
    if (lastCard) {
        if (lastCard.color === card.color) return false; // Don't drop if same color.
        if (parseInt(lastCard.referenceId.slice(1)) !== parseInt(card.referenceId.slice(1)) + 1) return false; // Drop if one number below.
        return true;
    } else return false;
}

function checkCompletePlacing(card, i) {
    if (card.isFlipped) return false;
    if (card.isInComplete) return false;

    let lastCard = completeArray[i][completeArray[i].length - 1];

    let slotSuit;
    switch (i) {
        case 0:
            slotSuit = "spades";
            break;
        case 1:
            slotSuit = "hearts";
            break;
        case 2:
            slotSuit = "clubs";
            break;
        case 3:
            slotSuit = "diamonds";
            break;
    }

    if (card.inColumnIndex) {
        let currentIndex = parseInt(card.inColumnIndex);
        console.log(boardArray[currentIndex][boardArray[currentIndex] + 1]);
        if (boardArray[currentIndex][boardArray[currentIndex] + 1]) return false; // Don't drop if card is not top of the column.
    }

    if (!lastCard && card.referenceId.slice(1) === "1" && slotSuit === card.suit) return true; // Drop on empty column if same suit and Ace.
    // Must ensure lastcard exists for later checks.
    if (lastCard) {
        if (slotSuit !== card.suit) return false; // Drop if same color.
        if (parseInt(lastCard.referenceId.slice(1)) !== parseInt(card.referenceId.slice(1)) - 1) return false; // Drop if one number above.
        return true;
    } else return false;
}

function checkWin() {
/*
    setInterval(() => {
        let slotIndex = 0;
        let id = setInterval(() => {
            if (slotIndex === 4) clearInterval(id);
            slotIndex++;

            const cardDiv = completeArray[slotIndex][completeArray[slotIndex].length - 1];
            set
        }, 1000);

    }, 4000);

    return;*/
    if (deckBoard.length === 0 && deckFlipped.length === 0) alert("Win"); // TODO CHECK
}