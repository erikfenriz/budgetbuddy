var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });

        //either exp or inc gets added to the data structure - data.totals[type]

        data.totals[type] = sum;

    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // Create new ID
            data.allItems[type].length > 0
                ?
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
                :
                ID = 0;

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },


        calculateBudget: function () {


            // calculate total income and expenses. and put them into data structure
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses

            // calculate the percentage of a spent income


        },


        testing: function () {
            console.dir(data);
        }
    };

})();

var UIController = (function () {

    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${obj.value}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">- ${obj.value}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }

            // Replace the placeholder text with some actual data


            // newHtml = html.replace('%id%', obj.id).replace('%description%', obj.description).replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, i, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        getDOMStrings: function () {
            return DOMStrings;
        }
    };
})();

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    };

    var updateBudget = function () {
        // 5. calculate the budget
        budgetCtrl.calculateBudget();
        // 6. return the budget

        // 7. display the budget on the UI
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // 1. get the value from the user's input
        input = UICtrl.getInput();
        console.log(input);
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add new item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add that new item ^ to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear fields and change focus

            UICtrl.clearFields();

            // call updateBudget

            updateBudget();


        }

    };

    return {
        init: function () {
            setupEventListeners();
        }
    }


})(budgetController, UIController);


controller.init();
