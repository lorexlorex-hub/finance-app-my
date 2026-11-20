let transactions = [];

try {
    const saved = localStorage.getItem("transactions");
    transactions = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(transactions)) {
        transactions = [];
    }
} catch (error) {
    transactions = [];
}

function saveData() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

const form = document.getElementById("transaction-form");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const type = document.getElementById("type").value;
    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const comment = document.getElementById("comment").value.trim();

    if (!title || !amount || amount <= 0 || !date) {
        alert("Проверьте правильность введённых данных");
        return;
    }

    const transaction = {
        id: Date.now(),
        type: type,
        title: title,
        amount: amount,
        category: document.getElementById("category").value,
        date: date,
        comment: comment
    };

    transactions.push(transaction);
    saveData();
    render();
    form.reset();

    document.getElementById("date").value = new Date()
        .toISOString()
        .slice(0, 10);
});

function calculateTotals() {
    let income = 0;
    let expenses = 0;

    transactions.forEach(function (item) {
        if (item.type === "income") {
            income += item.amount;
        } else if (item.type === "expense") {
            expenses += item.amount;
        }
    });

    return {
        income: income,
        expenses: expenses,
        balance: income - expenses
    };
}

function updateDashboard() {
    const totals = calculateTotals();

    document.getElementById("income").textContent =
        totals.income.toLocaleString("ru-RU") + " ₽";

    document.getElementById("expenses").textContent =
        totals.expenses.toLocaleString("ru-RU") + " ₽";

    document.getElementById("balance").textContent =
        totals.balance.toLocaleString("ru-RU") + " ₽";
}

function renderTransactions() {
    const container = document.getElementById("transactions-list");
    container.replaceChildren();

    const sorted = [...transactions].sort(function (a, b) {
        return b.date.localeCompare(a.date);
    });

    if (sorted.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Операций пока нет";
        container.appendChild(message);
        return;
    }

    sorted.forEach(function (item) {
        const row = document.createElement("div");
        row.className = "transaction";

        const information = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = item.title;

        const details = document.createElement("p");
        details.textContent = item.category + " | " + item.date;

        information.append(title, details);

        const amount = document.createElement("strong");
        amount.className = item.type;

        const sign = item.type === "income" ? "+" : "-";
        amount.textContent =
            sign + item.amount.toLocaleString("ru-RU") + " ₽";

        const button = document.createElement("button");
        button.textContent = "Удалить";
        button.className = "delete-button";

        button.addEventListener("click", function () {
            deleteTransaction(item.id);
        });

        row.append(information, amount, button);
        container.appendChild(row);
    });
}

function deleteTransaction(id) {
    const confirmed = confirm(
        "Вы действительно хотите удалить операцию?"
    );

    if (!confirmed) {
        return;
    }

    transactions = transactions.filter(function (item) {
        return item.id !== id;
    });

    saveData();
    render();
}

function renderStatistics() {
    const incomeByCategory = {};
    const expensesByCategory = {};

    transactions.forEach(function (item) {
        const category = item.category || "Без категории";

        if (item.type === "income") {
            incomeByCategory[category] =
                (incomeByCategory[category] || 0) + item.amount;
        }

        if (item.type === "expense") {
            expensesByCategory[category] =
                (expensesByCategory[category] || 0) + item.amount;
        }
    });

    const container = document.getElementById("statistics");
    container.replaceChildren();

    const hasIncome = Object.keys(incomeByCategory).length > 0;
    const hasExpenses = Object.keys(expensesByCategory).length > 0;

    if (!hasIncome && !hasExpenses) {
        container.textContent = "Операций пока нет";
        return;
    }

    const incomeTitle = document.createElement("h3");
    incomeTitle.textContent = "Доходы по категориям";
    container.appendChild(incomeTitle);

    if (hasIncome) {
        Object.entries(incomeByCategory).forEach(function ([category, amount]) {
            const line = document.createElement("p");
            line.textContent =
                category + ": +" + formatMoney(amount);
            container.appendChild(line);
        });
    } else {
        container.insertAdjacentHTML(
            "beforeend",
            "<p>Доходы отсутствуют</p>"
        );
    }

    const expensesTitle = document.createElement("h3");
    expensesTitle.textContent = "Расходы по категориям";
    container.appendChild(expensesTitle);

    if (hasExpenses) {
        Object.entries(expensesByCategory).forEach(function ([category, amount]) {
            const line = document.createElement("p");
            line.textContent =
                category + ": -" + formatMoney(amount);
            container.appendChild(line);
        });
    } else {
        container.insertAdjacentHTML(
            "beforeend",
            "<p>Расходы отсутствуют</p>"
        );
    }
}

function render() {
    updateDashboard();
    renderTransactions();
    renderStatistics();
}

document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.getElementById("date");

    dateInput.value = new Date()
        .toISOString()
        .slice(0, 10);

    render();
});

function formatMoney(value) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB"
    }).format(value);
}