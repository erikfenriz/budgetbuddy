var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
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
        budget: 0,
        percentage: -1
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
        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });
        }, getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPerc;
        },

        calculateBudget: function () {

            // calculate total income and expenses. and put them into data structure
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses

            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of a spent income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
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
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };


    var formatNumber = function (num, type) {
        var numSplit, int, dec, sign;
        num = Math.abs(num);

        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) +
                ','
                + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
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
                html = `<div class="item clearfix" id="inc-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value, type)}</div>
                        <div class="item__delete">
                        <button class="item__delete--btn">
                        <i class="ion-ios-close-outline"></i>
                        </button>
                        </div>
                        </div>
                        </div>`;
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = `<div class="item clearfix" id="exp-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value, type)}</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                        <button class="item__delete--btn">
                        <i class="ion-ios-close-outline"></i>
                        </button>
                        </div>
                        </div>
                        </div>`;
            }

            // Replace the placeholder text with some actual data

            // newHtml = html.replace('%id%', obj.id).replace('%description%', obj.description).replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
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
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expPercLabel);


            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = '---';
                }
            });

        },
        displayDate: function () {
            var now, year, month, monthsArr;
            now = new Date();

            year = now.getFullYear();

            month = now.getMonth();

            monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMStrings.dateLabel).textContent = monthsArr[month] + " " + year;


        },
        changedType: function () {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {


        // 1. calculate the budget
        budgetCtrl.calculateBudget();


        // 2. return the budget
        var budget = budgetCtrl.getBudget();


        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {

        // 1. calc percentages
        budgetCtrl.calculatePercentages();

        // 2.read percentages from the budget ctrl
        var percentages = budgetCtrl.getPercentages();

        // 3. Update percentages in the UI

        UICtrl.displayPercentages(percentages);

        console.log(percentages);

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

            // 5. call updateBudget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentages();

        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure

            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI

            UICtrl.deleteListItem(itemID);

            // 3. Update the budget

            updateBudget();

            // 4. calculate and update percentages

            updatePercentages();
        }
    };

    return {
        init: function () {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            setupEventListeners();

            UICtrl.displayDate();
        }

    }

})(budgetController, UIController);

controller.init();
