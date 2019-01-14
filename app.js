/**
 * Contains classes and methods that handle budget data
 * @returns object containing public methods
 */
const budgetController = function() {

    /**
     * Creates object that represents an expense
     */
    class Expense {
        /**
         * Expense constructor
         * @param {int} id - unique identifier for expense object 
         * @param {string} description - details of expense
         * @param {float} value - monetary amount
         */
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        /**
         * Calculates percentage of income that expense makes up
         * @param {float} totalIncome - sum of all income objects 
         */
        calcPercentage(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        }

        /**
         * Returns percentage
         * @returns calculated percentage
         */
        getPercentage() {
            return this.percentage;
        }
    }

    /**
     * Creates object that represents an income
     */
    class Income {
        /**
         * Income constructor
         * @param {int} id - unique identifier for income object
         * @param {string} description - details of income
         * @param {float} value - monetary amount
         */
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    // Private methods

    /**
     * Sums values of specified type
     * @param {string} type - expense or income 
     */
    const calculateTotal = function(type) {
        let sum = 0;

        data.allItems[type].forEach(curr => sum += curr.value);
        data.totals[type] = sum;
    }

    /**
     * Holds data of Income and Expense objects
     */
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
        /**
         * Creates new Expense or Income object, then adds it to data object
         * @param {string} type - expense or income 
         * @param {string} desc - details of item
         * @param {float} val - monetary amount 
         */
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

            // adds item to data object
            data.allItems[type].push(newItem);

            return newItem;
        },

        /**
         * Deletes Expense or Income object from data object
         * @param {string} type - expense or income 
         * @param {int} id - item's id
         */
        deleteItem: function(type, id) {
            let ids, index;

            ids = data.allItems[type].map(curr => curr.id);
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        /**
         * Calculates total budget
         */
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

        /**
         * Calculates percentage each expense makes up of total income
         */
        calculatePercentages: function() {
            data.allItems.exp.forEach(curr => curr.calcPercentage(data.totals.inc));
        },

        /**
         * Returns percentage of expense makes up of total income
         * @returns percentage of total income
         */
        getPercentages: function() {
            const allPerc = data.allItems.exp.map(curr => curr.getPercentage());
            return allPerc;
        },

        /**
         * Returns information from data object
         * @returns object containing budget, total incomes, total expenses, and percentage
         */
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

/**
 * Contains methods that handle the user interface
 * @returns object containing public methods
 */
const UIController = function() {

    // Private methods

    /**
     * Contains shorthand names for HTML classes
     */
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

    /**
     * Rounds number to two decimal places and prepends either '+' or '-'
     * @param {float} num - number 
     * @param {*} type - expense or income
     */
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
        /**
         * Retrieves input from HTML form
         * @returns object containing item type, description, and value
         */
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        /**
         * Adds item to respective type's list
         * @param {object} obj - object returned from getInput 
         * @param {string} type - income or expense
         */
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

        /**
         * Deletes item from list
         * @param {int} selectorID - item's id
         */
        deleteListItem: function(selectorID) {
            const element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        /**
         * Clears HTML form fields
         */
        clearFields: function() {

            const fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            const fieldsArr = Array.from(fields);
            fieldsArr.forEach(curr => curr.value = "");

            // Resets focus back to description field
            fieldsArr[0].focus();

        },

        /**
         * Displays current budget on user interface
         * @param {object} obj - data object  
         */
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

        /**
         * Displays percentages for each Expense item on user interface
         * @param {float} percentages - percentage each expense makes up of total income 
         */
        displayPercentages: function(percentages) {
            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            const fieldsArr = Array.from(fields);
            fieldsArr.forEach((curr, index) => curr.textContent = (percentages[index] > 0) ? percentages[index] + '%' : '---');
        },

        /**
         * Displays current month and year on user interface
         */
        displayDate: function() { 
            
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },

        /**
         * Changes fields and submit button from green to red if item is an Expense
         */
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

        /**
         * Returns object containing shorthand names for HTML classes
         * @returns object containing shorthand names for HTML classes
         */
        getDOMstrings: function() {
            return DOMstrings;
        }
    };

}

/**
 * Controls budget data and user interface
 * @param {object} budgetCtrl - budgetController public methods
 * @param {object} UICtrl - UIController public methods
 * @returns object containing public methods
 */
const controller = function(budgetCtrl, UICtrl) {

    // Private methods

    /**
     * Adds event listeners
     */
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

    /**
     * Calculates, returns, and displays budget
     */
    const updateBudget = function() {

        // Calculate budget
        budgetCtrl.calculateBudget();

        // Return the budget
        const budget = budgetCtrl.getBudget();

        // Display budget on UI
        UICtrl.displayBudget(budget);

    }

    /**
     * Calculates and updates percentages
     */
    const updatePercentages = function() {
        // Calculate percentages
        budgetCtrl.calculatePercentages();

        // Read percentages from the budget controller
        const percentages = budgetCtrl.getPercentages();

        // Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    /**
     * Updates data and UI whenever item is added
     */
    const ctrlAddItem = function() {

        // Get input data
        const input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // Add item to the budget controller
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add item to UI
            UICtrl.addListItem(newItem, input.type);

            // Clear fields
            UICtrl.clearFields();

            // Calculate and update budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }

    }

    /**
     * Updates data and UI whenever item is deleted
     */
    const ctrlDeleteItem = function(event) {

        // Locates item where delete button was pressed
        const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            const splitID = itemID.split('-');
            const type = splitID[0];
            const ID = parseInt(splitID[1]);

            // Delete item from budget controller
            budgetCtrl.deleteItem(type, ID);

            // Delete item from UI
            UICtrl.deleteListItem(itemID);

            // Update and show new budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }

    }

    // Public methods
    return {
        /**
         * Starts application
         */
        init: function() {
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