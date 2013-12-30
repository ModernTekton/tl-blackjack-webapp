function Card(pSuit, pNumber) {
    var suit = pSuit;
    var number = pNumber;

    this.getNumberName = function () {
        switch (number) {
            case 11:
                return "jack";
            case 12:
                return "queen";
            case 13:
                return "king";
            case 1:
                return "ace";
            default:
                return number;
        }
    };

    this.getSuitName = function () {
        switch (suit) {
            case 1:
                return "spades";
            case 2:
                return "hearts";
            case 3:
                return "diamonds";
            case 4:
                return "clubs";
        }
    };
    this.getValue = function () {
        switch (number) {
            case 11:
            case 12:
            case 13:
                return 10;
            case 1:
                return 11;
            default:
                return number;
        }
    };
    this.getImageElement = function () {
        var className = this.getSuitName() + "-" + this.getNumberName();
        return $('<span></span>').addClass("card-image " + className);
    }
}

function Deck() {
    var cards = [];
    var counter = 0;
    var reset = function () {
        for (var i = 1; i <= 4; i++) {
            for (var j = 1; j <= 13; j++) {
                cards.push(new Card(i, j));
            }
        }
        shuffle();
    };
    var shuffle = function () {
        for (var i = 0; i < 500; i++) {
            changeRandomly();
        }
    };
    var changeRandomly = function () {
        var a = Math.floor(Math.random() * cards.length);
        var b = Math.floor(Math.random() * cards.length);
        var help = cards[a];
        cards[a] = cards[b];
        cards[b] = help;
    };
    reset();
    this.deal = function () {
        return cards[counter++];
    };

    this.getDeckImageElement = function () {
        return $('<span></span>').addClass("card-image deck");
    }
}

function Hand(pDeck) {
    var deck = pDeck;
    var cards = [deck.deal(), deck.deal()];

    this.score = function () {
        var sum = 0;
        var numberOfAces = 0;
        for (var i = 0; i < cards.length; i++) {
            sum += cards[i].getValue();
            if (cards[i].getValue() == 11) {
                numberOfAces++;
            }
        }
        // check if the score is too high and there are aces to floor the score
        while (sum > 21 && numberOfAces > 0) {
            sum -= 10;
            numberOfAces--;
        }

        return sum;
    };
    this.printHand = function () {
        var hand = "";
        for (var i = 0; i < cards.length; i++) {
            hand += cards[i].getNumberName() + " of " + cards[i].getSuitName();
            if (i < cards.length - 1) {
                hand += ", ";
            }
        }
        return hand;
    };
    this.drawHand = function (element) {
        element.html("");
        for (var i = 0; i < cards.length; i++) {
            element.append(cards[i].getImageElement());
        }
    };
    this.hitMe = function () {
        cards.push(deck.deal());
    };
}

function GameManager() {
    var win = 0;
    var draw = 0;
    var lose = 0;

    var userHand;
    var dealerHand;
    var deck;

    this.playGame = function () {
        if (!nameIsSet()) {
            updateMessage("Enter a name before starting the game!", "alert-error");
            return;
        }
        deck = new Deck();
        clearUserInterface();
        userHand = new Hand(deck);
        updateUserHandAndScore();
    };

    this.playerHit = function () {
        userHand.hitMe();
        updateUserHandAndScore();
        if (userHand.score() > 21) {
            this.playerStand();
        }
    };

    this.playerStand = function () {
        dealerHand = playAsDealer(deck);
        updateDealerHandAndScore();
        console.log("dealer's hand: " + dealerHand.printHand());
        console.log("dealer's score: " + dealerHand.score());
        console.log("your hand: " + userHand.printHand());
        console.log("your score: " + userHand.score());
        console.log("");
        drawResult(declareWinner(userHand, dealerHand));
        disableButtons();
    };

    var clearUserInterface = function () {
        var userCards = $("#userCards");
        userCards.html("");
        userCards.append(deck.getDeckImageElement());
        userCards.append(deck.getDeckImageElement());
        $("#userScore").text("no score");

        var dealerCards = $("#dealerCards");
        dealerCards.html("");
        dealerCards.append(deck.getDeckImageElement());
        dealerCards.append(deck.getDeckImageElement());
        $("#dealerScore").text("no score");

        updateMessage("Game is starting...", "alert-info");
        $("#startGame").prop("disabled", true);
        $("#hit").prop("disabled", false);
        $("#stand").prop("disabled", false);
    };

    var disableButtons = function () {
        $("#startGame").prop("disabled", false);
        $("#hit").prop("disabled", true);
        $("#stand").prop("disabled", true);
    };

    var nameIsSet = function () {
        var name = $("#userNameInput").val();
        if (name !== null && name !== undefined && name !== "") {
            $("#userName").text(name);
            return true;
        } else {
            return false;
        }
    };

    var declareWinner = function (userHand, dealerHand) {
        if (userHand.score() > 21) {
            if (dealerHand.score() > 21) {
                draw++;
                return "You tied!";
            } else {
                lose++;
                return "You lose!";
            }
        } else {
            if (dealerHand.score() > 21) {
                win++;
                return "You win!";
            } else if (userHand.score() > dealerHand.score()) {
                win++;
                return "You win!";
            } else if (userHand.score() === dealerHand.score()) {
                draw++;
                return "You tied!";
            } else {
                lose++;
                return "You lose!";
            }
        }
    };

    var playAsDealer = function (deck) {
        var hand = new Hand(deck);
        while (hand.score() < 17) {
            hand.hitMe();
        }
        return hand;
    };

    var drawResult = function (result) {
        switch (result) {
            case "You lose!":
                updateMessage(result, "alert-error");
                break;
            case "You tied!":
                updateMessage(result, "alert-warning");
                break;
            case "You win!":
                updateMessage(result, "alert-success");
                break;
        }
        drawOverallScore();
    };

    var drawOverallScore = function () {
        var count = gamesPlayed();
        $("#wonBar").css("width", (win / count * 100) + "%").text(Math.round(win / count * 100) + "%");
        $("#drawBar").css("width", (draw / count * 100) + "%").text(Math.round(draw / count * 100) + "%");
        $("#lostBar").css("width", (lose / count * 100) + "%").text(Math.round(lose / count * 100) + "%");
        $("#wonBadge").text(win);
        $("#drawBadge").text(draw);
        $("#lostBadge").text(lose);
    };

    var gamesPlayed = function () {
        return win + draw + lose;
    };

    var updateMessage = function (message, style) {
        $("#gameStatus").removeClass("alert-info alert-error alert-warning alert-success");
        $("#gameStatus").text(message);
        $("#gameStatus").addClass(style);
    };

    var updateUserHandAndScore = function () {
        //$("#userCards").text(userHand.printHand());
        var userCardsElement = $("#userCards");
        userHand.drawHand(userCardsElement);
        $("#userScore").text(userHand.score());
        updateMessage("Need another card?", "alert-info");
    };

    var updateDealerHandAndScore = function () {
        //$("#dealerCards").text(dealerHand.printHand());
        var dealerCardsElement = $("#dealerCards");
        dealerHand.drawHand(dealerCardsElement);
        $("#dealerScore").text(dealerHand.score());
    };
}