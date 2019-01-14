const budgetController = function() {

    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        calcPercentage(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        }

        getPercentage() {
            return this.percentage;
        }
    }

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    // Private methods
    const calculateTotal = function(type) {
        let sum = 0;

        data.allItems[type].forEach(curr => sum += curr.value);
        data.totals[type] = sum;
    }

    const data = {
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

    // Public methods
    return {
        addItem: function(type, desc, val) {
            let newItem, ID;

            // Create new ID
            ID = (data.allItems[type].length > 0) ? data.allItems[type][data.allItems[type].length - 1].id + 1 : 0;

            // Create new exp or inc item
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        // forgot how this works
        deleteItem: function(type, id) {
            let ids, index;

            ids = data.allItems[type].map(curr => curr.id);
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(curr => curr.calcPercentage(data.totals.inc));
        },

        getPercentages: function() {
            const allPerc = data.allItems.exp.map(curr => curr.getPercentage());
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    }
    
}

const UIController = function() {

    // Private methods
    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    const formatNumber = function(num, type) {
        let numSplit, modNum, int, dec, sign;

        modNum = Math.abs(num).toFixed(2);
        numSplit = modNum.split('.');
        int = numSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        dec = numSplit[1];
        sign = (type === 'exp') ? '-' : '+';

        return sign + ' ' + int + '.' + dec; 
    }

    // Public methods
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or expense
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                // maybe add date here later
            };
        },

        addListItem: function(obj, type) {
            let html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>
                        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if (type == 'exp') {
                element = DOMstrings.expensesContainer;
                html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
                        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
                        <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }
            
            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            const element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {

            const fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            const fieldsArr = Array.from(fields);
            fieldsArr.forEach(curr => curr.value = "");

            // Resets focus back to description field
            fieldsArr[0].focus();

        },

        displayBudget: function(obj) {

            const type = (obj.budget >= 0) ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {
            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            const fieldsArr = Array.from(fields);
            fieldsArr.forEach((curr, index) => curr.textContent = (percentages[index] > 0) ? percentages[index] + '%' : '---');
        },

        displayDate: function() { 
            
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },

        changedType: function() {

            const fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue  
            );

            const fieldsArr = Array.from(fields);
            fieldsArr.forEach(curr => curr.classList.toggle('red-focus'));

            const btn = document.querySelector(DOMstrings.inputBtn);
            btn.classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

}

// Global App Controller
const controller = function(budgetCtrl, UICtrl) {

    // Private methods
    const setupEventListeners = function() {

        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', event => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    const updateBudget = function() {

        // 1. calculate budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        const budget = budgetCtrl.getBudget();

        // 3. display budget on ui
        UICtrl.displayBudget(budget);

    }

    const updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        const percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    const ctrlAddItem = function() {

        // 1. Get input data
        const input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add item to the budget controller
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }

    }

    const ctrlDeleteItem = function(event) {

        const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            const splitID = itemID.split('-');
            const type = splitID[0];
            const ID = parseInt(splitID[1]);

            // 1. Delete item from array
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }

    }

    // Public methods
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })

            setupEventListeners();
        }
    }

}

budgetCtrl = budgetController();
UICtrl = UIController();
ctrl = controller(budgetCtrl, UICtrl);

ctrl.init();