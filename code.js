import drawChart from "./chart.js";
const headerDateTime = document.querySelector("#pdate-time");
const inpTitle = document.querySelector("#inp-title");
const inpAmount = document.querySelector("#inp-amount");
const inpCategory = document.querySelector("#inp-category");
const addButton = document.querySelector("#add-btn");
const tAmount = document.querySelector(".tamount");
const tEntries = document.querySelector(".tentries");
const tMonth = document.querySelector(".tmonth");
const categoryFilt = document.querySelector("#fil-category");
const disWrapper = document.querySelector(".dis-wrapper");
const inpPaymentType = document.querySelector("#inp-type");
const inpComment = document.querySelector("#inp-comment");
const categoryChart = document.querySelector("#category-select");

//date and time Updation

setInterval(() => {
  headerDateTime.innerText = new Date().toLocaleString();
}, 1000);

//Getting data from Local Storage...

function getExpense() {
  return JSON.parse(localStorage.getItem("expense")) || [];
}
let expenseArr = getExpense();

//Setting data to Local STorage...

function setLocal(name, arr) {
  return localStorage.setItem(name, JSON.stringify(arr));
}

//function to find category total from expenseArr

function findTotal() {
  const categoryTotal = expenseArr.reduce((acc, current) => {
    const isExisted = acc.find((item) => item.category === current.category);
    if (isExisted) {
      isExisted.totalExpense += current.expense;
      isExisted.repeat += 1;
      isExisted.lastModified = current.time;
      return acc;
    }

    acc.push({
      category: current.category,
      totalExpense: current.expense,
      lastModified: current.time,
      repeat: 1,
    });
    return acc;
  }, []);
  return categoryTotal;
}

//Function for updating UI

function updateUI() {
  totalExpdis();
  totalEntries();
  monthTExp();
  renderTotChart(); //Total expense chart Updated
  renderCatChart(); //Category chart Updated
}

//dark mode

const darkBtn = document.querySelector("#dark-btn");

function getDark() {
  return JSON.parse(localStorage.getItem("isDark")) ?? null;
}

if (getDark()) {
  document.body.classList.add("dark-mode");
} else {
  document.body.classList.remove("dark-mode");
}

function setDark(dark) {
  setLocal("isDark", dark);
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  let dark = !getDark();
  setDark(dark);
}

darkBtn.addEventListener("click", toggleTheme);

//profile sec

//function on print button
const printBtn = document.querySelector("#printbtn");

printBtn.addEventListener("click", () => {
  window.print();
});

//function on add button

const addSec = document.querySelector("#add-sec");

addButton.addEventListener("click", () => {
  const title = inpTitle.value.trim();
  const expense = Number(inpAmount.value);
  const category = inpCategory.value;
  const time = new Date();
  const comment = inpComment.value;
  const paymentType = inpPaymentType.value;

  if (title === "") {
    alert("Please fill all fields");
    return;
  }

  if (!Number.isFinite(expense) || expense <= 0) {
    alert("Invalid amount");
    return;
  }

  const newExp = {
    id: Date.now(),
    category,
    title,
    expense,
    paymentType,
    time,
    comment,
  };

  expenseArr.push(newExp);

  setLocal("expense", expenseArr);
  floatingBtn.classList.remove("hidden");
  addSec.classList.add("hidden");
  inpAmount.value = "";
  inpTitle.value = "";
  inpCategory.selectedIndex = 0;
  inpPaymentType.selectedIndex = 0;
  inpComment.value = "";
  upsertCatCard(newExp);
  updateUI();
});

//function for upsert Category card

function upsertCatCard(newExp) {
  const category = newExp.category;
  const isExisted = disWrapper.querySelector(`.${category}`);
  if (isExisted) {
    updateCatCard(newExp);
    return;
  } else {
    addCatCard(newExp);
  }
}

// function to update category card in DOM

function updateCatCard(Exp) {
  const category = Exp.category;
  const card = disWrapper.querySelector(`.${category}`);
  const list = card.querySelector("#expenseSelect");

  const option = document.createElement("option");
  option.innerText = Exp.title;
  option.id = Exp.id;
  list.appendChild(option);
  list.selectedIndex = 0;
  list.dispatchEvent(new Event("change", { bubbles: true }));
  updateUI();
}

//function to add category card in DOM

function addCatCard(Exp) {
  const card = createCategoryCard(Exp.category, Exp.expense, Exp.time);
  disWrapper.appendChild(card);

  const option = document.createElement("option");
  option.innerText = Exp.category.toUpperCase();
  option.className = Exp.category;
  option.value = Exp.category;
  categoryFilt.appendChild(option);
  categoryChart.appendChild(option.cloneNode(true));
  updateUI();
}

//floating add button

const floatingBtn = document.querySelector("#flot-btn");

floatingBtn.addEventListener("click", () => {
  floatingBtn.classList.add("hidden");
  addSec.classList.remove("hidden");
});

//total expense display

function totalExpdis() {
  let exp = Math.ceil(
    expenseArr.reduce((acc, current) => acc + Number(current.expense), 0),
  );
  tAmount.innerText = `₹ ${exp}`;
}
totalExpdis();

//total entries display

function totalEntries() {
  tEntries.innerText = expenseArr.length;
}
totalEntries();

//this month total entries

function monthTExp() {
  let today = new Date();
  const filtered = expenseArr
    .filter((item) => {
      let expDate = new Date(item.time);
      return (
        today.getMonth() == expDate.getMonth() &&
        today.getFullYear() == expDate.getFullYear()
      );
    })
    .reduce((acc, current) => acc + Number(current.expense), 0);
  tMonth.innerText = `₹ ${filtered}`;
}
monthTExp();

//chart type & category selection

const chartWrapper = document.querySelector(".chartwrapper");
chartWrapper.addEventListener("change", (e) => {
  const total = e.target.closest("#total-select");
  const category = e.target.closest("#category-select");

  if (!category && !total) return;

  if (total) {
    renderTotChart(e.target.value);
  } else if (category) {
    renderCatChart(e.target.value);
  }
});

//dynamic Total chart fuction

const totalCanvas = document.querySelector("#total-canvas");
function renderTotChart() {
  const totalChartSelect = chartWrapper.querySelector("#total-select");
  const type = totalChartSelect.value;
  const expArr = findTotal();
  if (!expArr.length) return;
  drawChart(totalCanvas, type, expArr);
}

renderTotChart();

//dynamic category charts options

renderCategories(categoryChart);

//dynamic category chart functinn

const categoryCanvas = document.querySelector("#category-canvas");
function renderCatChart() {
  const catChartSelect = chartWrapper.querySelector("#category-select");
  const selectValue = catChartSelect.value;

  const expArr = expenseArr.filter((item) => item.category === selectValue);

  const tempArr = expArr.map((item) => {
    return {
      category: item.title,
      totalExpense: item.expense,
    };
  });
  if (!tempArr.length) return;
  drawChart(categoryCanvas, "doughnut", tempArr);
}

renderCatChart();

//dynamic Select option

function renderCategories(appendTo, includeAll = false) {
  if (includeAll) {
    appendTo.innerHTML = ` <option value="all-category">All CATEGORIES</option>`;
  } else {
    appendTo.innerHTML = "";
  }

  const list = expenseArr.map((item) => item.category);
  const categories = [...new Set(list)].sort();

  for (let i = 0; i < categories.length; i++) {
    const item = document.createElement("option");

    item.innerText = categories[i].toUpperCase();
    item.value = categories[i];
    appendTo.appendChild(item);
  }
}

renderCategories(categoryFilt, true);

//Event on transaction-control section

const controlSec = document.querySelector(".transaction-controls");
controlSec.addEventListener("change", (e) => {
  const filter = e.target.closest("#fil-category");
  const sortSelect = e.target.closest("#sort-by");

  if (!sortSelect && !filter) {
    return;
  }

  if (filter) {
    changedFilter();
  } else if (sortSelect) {
    sortBy(sortSelect);
  }
});

//function for applying filter

function changedFilter() {
  let category = document.querySelectorAll(".exp-dis");
  category.forEach((element) => {
    element.classList.remove("hidden");
    if (
      categoryFilt.value !== "all-category" &&
      !element.classList.contains(categoryFilt.value)
    ) {
      element.classList.add("hidden");
    }
  });
}

//function for filtered Exp
function getFilteredArr(value) {
  return expenseArr.filter((item) => item.title.toLowerCase().includes(value));
}

//Event for search

const search = document.querySelector("#searchExp");
let timerId;
search.addEventListener("input", (e) => {
  const value = e.target.value.trim().toLowerCase();
  const datalist = document.querySelector("#search-options");

  clearTimeout(timerId);

  if (!value) {
    return;
  }

  function createOption(item) {
    const option = document.createElement("option");
    option.value = item.title;
    option.innerText = item.title;
    datalist.appendChild(option);
  }

  timerId = setTimeout(() => {
    const filteredArr = getFilteredArr(value);
    if (filteredArr.length) {
      datalist.innerHTML = "";
      filteredArr.forEach((item) => createOption(item));
    } else {
      datalist.innerHTML = "";
      return;
    }
  }, 300);
});

//Event on search button

const searchBtn = document.querySelector("#search-btn");
searchBtn.addEventListener("click", (e) => {
  const searchField = e.target
    .closest(".search-div")
    .querySelector("#searchExp");
  let filteredArr = getFilteredArr(searchField.value.trim().toLowerCase());
  if (!filteredArr.length) {
    alert("No result found");
    return;
  }
  const card = createViewAllCard(filteredArr);
  const currentCard = e.target.closest(".transaction-controls");
  if (card) {
    currentCard.after(card);
  }
});

//functions for Sort by

function sortBy(sortSelect) {
  if (!sortSelect) {
    sortByDefault();
    return;
  }

  switch (sortSelect.selectedOptions[0].value) {
    case "asc-amount":
      sortByAscAmount();
      break;
    case "dsc-amount":
      sortByDscAmount();
      break;
    case "newest-date":
      sortByNewDate();
      break;
    case "oldest-date":
      sortByOldDate();
      break;
    case "transaction":
      sortByTrans();
      break;
    default:
      sortByDefault();
      break;
  }
}
sortBy();

//Sorting functions

function sortByDefault() {
  const sortedArr = findTotal().sort((a, b) =>
    a.category.localeCompare(b.category),
  );
  renderCatCard(sortedArr);
}

function sortByAscAmount() {
  const sortedArr = findTotal().sort((a, b) => a.totalExpense - b.totalExpense);
  renderCatCard(sortedArr);
}

function sortByDscAmount() {
  const sortedArr = findTotal().sort((a, b) => b.totalExpense - a.totalExpense);
  renderCatCard(sortedArr);
}

function sortByNewDate() {
  const sortedArr = findTotal().sort(
    (a, b) => new Date(b.lastModified) - new Date(a.lastModified),
  );
  renderCatCard(sortedArr);
}

function sortByOldDate() {
  const sortedArr = findTotal().sort(
    (a, b) => new Date(a.lastModified) - new Date(b.lastModified),
  );
  renderCatCard(sortedArr);
}

function sortByTrans() {
  const sortedArr = findTotal().sort((a, b) => b.repeat - a.repeat);
  renderCatCard(sortedArr);
}

//Create Category card

function createCategoryCard(category, amt, time) {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.className = `exp-dis ${category}`; //yha ek aur class add krni hai category ki  Done
  wrapperDiv.dataset.category = category;

  const categoryDiv = document.createElement("div"); //child 1
  categoryDiv.className = "category";
  const icon = document.createElement("img"); // image tag created
  icon.className = "category-icon";
  icon.alt = "category-icon";
  icon.src = `./assets/${category}.png`; //dynamic images src yet to be added
  categoryDiv.appendChild(icon); //sub-child 1
  const para = document.createElement("p"); //p tag created
  para.innerText = category.toUpperCase(); //dynamic name
  categoryDiv.appendChild(para); //sub-child 2 appended
  wrapperDiv.appendChild(categoryDiv); //child 1 appended

  const expenseLi = document.createElement("div"); //child 2
  expenseLi.className = "listdiv";
  const list = document.createElement("select"); //sub child 1
  list.className = "list";
  list.id = "expenseSelect";
  renderOptCategory(list, category);
  expenseLi.appendChild(list);

  const viewBtn = document.createElement("button"); //sub child 2
  viewBtn.className = "view-btn";
  viewBtn.id = "viewbtn";
  const viewImg = document.createElement("img");
  viewImg.src = "./assets/view.png";
  viewBtn.appendChild(viewImg);
  expenseLi.appendChild(viewBtn);
  wrapperDiv.appendChild(expenseLi);

  const categoryAmtDiv = document.createElement("div"); //child 3
  categoryAmtDiv.className = "category-amount";

  const expenseDetails = document.createElement("div"); //sub-child 1
  expenseDetails.className = "exp-dt";
  const amtPara = document.createElement("p");
  amtPara.className = "exp amount";
  amtPara.innerText = `₹ ${amt}`; //category final amt is yet to be added
  amtPara.id = "amount-display";
  expenseDetails.appendChild(amtPara);
  const span = document.createElement("span");
  span.className = "d-t";
  span.id = "time-display"; //time is yet to be aded
  span.innerText = new Date(time).toLocaleString();
  expenseDetails.appendChild(span);
  categoryAmtDiv.appendChild(expenseDetails); // sub child 1 appended

  const editDelDiv = document.createElement("div");
  editDelDiv.className = "editDelDiv";

  const edit = document.createElement("button"); //sub child 2 created
  edit.className = "editExp";
  edit.id = "editbtn";
  const img = document.createElement("img");
  img.src = "./assets/edit.png";
  edit.appendChild(img);
  editDelDiv.appendChild(edit); //sub child 2 appended

  const deleteDiv = document.createElement("div"); //sub child 3 created
  deleteDiv.className = "delete";
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.id = "deletebtn";
  deleteButton.type = "button";
  const buttonImg = document.createElement("img");
  buttonImg.className = "delete-img";
  buttonImg.src = "./assets/delete.png";
  deleteButton.appendChild(buttonImg);
  deleteDiv.appendChild(deleteButton);
  editDelDiv.appendChild(deleteDiv);
  categoryAmtDiv.appendChild(editDelDiv); //sub-child 3 appended
  wrapperDiv.appendChild(categoryAmtDiv); // child 2 appended

  return wrapperDiv;
}

//dynamic options for select in category card

function renderOptCategory(appendto, category) {
  const count = expenseArr;

  //static option
  const option = document.createElement("option");
  option.innerText = "Category Expenses";
  option.className = category;
  option.dataset.category = category;
  option.id = "Category-total"; //used in edit button
  appendto.appendChild(option);

  //dynamic list option
  for (let i = 0; i < count.length; i++) {
    if (count[i].category == category) {
      const option = document.createElement("option");
      option.innerText = count[i].title;
      option.dataset.category = count[i].category;
      option.id = count[i].id;
      appendto.appendChild(option);
    }
  }
}

//dynamic category Card rendered

function renderCatCard(sortedArr) {
  disWrapper.innerHTML = "";
  sortedArr.forEach((item) => {
    const card = createCategoryCard(
      item.category,
      item.totalExpense,
      item.lastModified,
    );
    disWrapper.appendChild(card);
  });
}

//event on list in individual expense

disWrapper.addEventListener("change", (e) => {
  const list = e.target.closest(".list");
  if (!list) {
    return;
  }

  const option = e.target.selectedOptions[0];
  const wrapper = e.target.closest(".exp-dis");
  const amountEl = wrapper.querySelector("#amount-display");
  const timeEl = wrapper.querySelector("#time-display");
  let expense = null;
  let time = null;

  if (option.id === "Category-total") {
    const categoryTotal = findTotal().find(
      (item) => item.category === option.dataset.category,
    );
    expense = categoryTotal.totalExpense;
    time = categoryTotal.lastModified;
  } else {
    const exp = expenseArr.find((item) => item.id === Number(option.id));
    expense = exp.expense;
    time = exp.time;
  }

  amountEl.innerText = `₹ ${expense}`;
  timeEl.innerText = new Date(time).toLocaleString();
});

//Event on category Card

disWrapper.addEventListener("click", (e) => {
  const editBtn = e.target.closest("#editbtn");
  const delBtn = e.target.closest("#deletebtn");
  const viewAllBtn = e.target.closest("#viewbtn");

  if (!editBtn && !delBtn && !viewAllBtn) {
    return;
  }

  if (editBtn) {
    editExp(editBtn);
  } else if (delBtn) {
    deleteExp(delBtn);
  } else if (viewAllBtn) {
    viewAllExp(viewAllBtn);
  }
});

// Function on view All button in category card

function viewAllExp(viewAllBtn) {
  renderedViewAllCard(viewAllBtn);
}

//View-all card created

function createViewAllCard(filteredArr, currentCatCard) {
  const isExisted = document.querySelector(".viewallWrapper");
  if (isExisted) {
    alert("One ViewAll card is already opened. Kindly close one");
    return;
  }

  const wrapperDiv = document.createElement("div"); //parent
  wrapperDiv.className = "viewallWrapper";

  const headDiv = document.createElement("div"); //Child 1
  headDiv.className = "head-div";

  const head = document.createElement("h2"); //sub-child 1
  head.innerText = "Expense display";
  headDiv.appendChild(head);

  const toolDiv = document.createElement("div"); //sub-child 2
  toolDiv.className = "viewall-toolDiv";

  const printBtn = document.createElement("button");
  printBtn.type = "button";
  printBtn.className = "viewall-btn";
  printBtn.id = "viewall-printbtn";
  const printImg = document.createElement("img");
  printImg.src = "./assets/print.png";
  printBtn.appendChild(printImg);
  toolDiv.appendChild(printBtn);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "viewall-btn";
  closeBtn.id = "viewall-closebtn";
  const closeImg = document.createElement("img");
  closeImg.src = "./assets/close-view.png";
  closeBtn.appendChild(closeImg);
  toolDiv.appendChild(closeBtn);

  headDiv.appendChild(toolDiv);

  wrapperDiv.appendChild(headDiv);

  //table

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "tableWrapper";
  const table = document.createElement("table");

  //table head

  const thead = document.createElement("thead");
  const tr = document.createElement("tr");

  const catTh = document.createElement("th");
  catTh.innerText = "Category";
  tr.appendChild(catTh);

  const titleTh = document.createElement("th");
  titleTh.innerText = "Title";
  tr.appendChild(titleTh);

  const amountTh = document.createElement("th");
  amountTh.innerText = "Amount";
  tr.appendChild(amountTh);

  const paymentTh = document.createElement("th");
  paymentTh.innerText = "Paid with";
  tr.appendChild(paymentTh);

  const dateTh = document.createElement("th");
  dateTh.innerText = "Date & Time";
  tr.appendChild(dateTh);

  const commentTh = document.createElement("th");
  commentTh.innerText = "comment";
  tr.appendChild(commentTh);

  const actionTh = document.createElement("th");
  actionTh.innerText = "Actions";
  tr.appendChild(actionTh);

  thead.appendChild(tr);
  table.appendChild(thead);

  //table body

  const tbody = document.createElement("tbody");

  filteredArr.forEach((item) => {
    const bodytr = document.createElement("tr");

    const catTd = document.createElement("td");
    catTd.innerText = item.category;
    bodytr.appendChild(catTd);

    const titleTd = document.createElement("td");
    titleTd.innerText = item.title;
    titleTd.dataset.field = "title";
    bodytr.appendChild(titleTd);

    const amountTd = document.createElement("td");
    amountTd.innerText = item.expense;
    amountTd.dataset.field = "amount";
    bodytr.appendChild(amountTd);

    const paidWithTd = document.createElement("td");
    paidWithTd.innerText = item.paymentType;
    bodytr.appendChild(paidWithTd);

    const dateTd = document.createElement("td");
    dateTd.innerText = item.time;
    bodytr.appendChild(dateTd);

    const commentTd = document.createElement("td");
    commentTd.innerText = item.comment;
    bodytr.appendChild(commentTd);

    const actionTd = document.createElement("td");
    actionTd.className = "actioncell";
    const editBtn = document.createElement("button");
    editBtn.className = "viewall-action-btn";
    editBtn.id = "viewall-edit-btn";
    const editImg = document.createElement("img");
    editImg.src = "./assets/edit.png";
    editBtn.appendChild(editImg);
    actionTd.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.className = "viewall-action-btn";
    delBtn.id = "viewall-del-btn";
    const delImg = document.createElement("img");
    delImg.src = "./assets/delete.png";
    delBtn.appendChild(delImg);
    actionTd.appendChild(delBtn);

    bodytr.appendChild(actionTd);

    bodytr.dataset.id = item.id;
    tbody.appendChild(bodytr);
  });

  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  attachEventOnTable(table, currentCatCard);
  wrapperDiv.appendChild(tableWrapper);
  attachEventOnViewAllCard(wrapperDiv, currentCatCard);
  return wrapperDiv;
}

//event on button in view all card

function attachEventOnViewAllCard(tableWrapper, currentCatCard) {
  tableWrapper.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("#viewall-closebtn");
    const printBtn = e.target.closest("#viewall-printbtn");

    if (!closeBtn && !printBtn) {
      return;
    }

    if (printBtn) {
      window.print();
    } else if (closeBtn) {
      if (currentCatCard) {
        const viewBtn = currentCatCard.querySelector("#viewbtn");
        const list = currentCatCard.querySelector("#expenseSelect");
        const editBtn = currentCatCard.querySelector("#editbtn");
        const deleteBtn = currentCatCard.querySelector("#deletebtn");
        list.disabled = false;
        editBtn.disabled = false;
        deleteBtn.disabled = false;
        viewBtn.style.visibility = "visible";
      }
      tableWrapper.remove();
    }
  });
}

//event on table action buttons in viewAll Card

function attachEventOnTable(table, currentCatCard) {
  table.addEventListener("click", (e) => {
    const editBtn = e.target.closest("#viewall-edit-btn");
    const delBtn = e.target.closest("#viewall-del-btn");

    if (!editBtn && !delBtn) {
      return;
    }

    if (editBtn) {
      editExpRow(editBtn, currentCatCard);
    } else if (delBtn) {
      deleteExpRow(delBtn, currentCatCard);
    }
  });
}

//Edit function in view all table

function editExpRow(editBtn, currentCatCard) {
  const row = editBtn.closest("tr");
  const tableWrapper = row.closest(".tableWrapper");
  const id = Number(row.dataset.id);

  const item = expenseArr.find((item) => item.id === id);

  if (item) {
    const card = createEditCard(item, {
      type: "table",
      currentCard: currentCatCard,
      row: row,
    });

    if (card) {
      tableWrapper.after(card);
    }
  }
}

//Delete function in view all table

function deleteExpRow(delBtn, currentCatCard) {
  if (confirm("Are you sure! you want to delete this expense?")) {
    const row = delBtn.closest("tr");
    const id = Number(row.dataset.id);
    const tableWrapper = row.closest(".viewallWrapper");
    const list = currentCatCard.querySelector("#expenseSelect");
    const selectedOption = list.selectedOptions[0];
    const category = selectedOption.dataset.category;
    const deleteBtn = currentCatCard.querySelector("#deleteBtn");
    const editBtn = currentCatCard.querySelector("#editBtn");
    const viewAllBtn = currentCatCard.querySelector("#viewBtn");

    if (selectedOption.id === "Category-total") {
      expenseArr = expenseArr.filter((item) => item.id !== id);
      const deletedOption = list.querySelector(`[id="${id}"]`);
      const remainingExp = expenseArr.filter(
        (item) => item.category === category,
      );
      if (!remainingExp.length) {
        tableWrapper.remove();
        currentCatCard.remove();
        removeCategoryOptions(category);
      } else {
        row.remove();
        deletedOption.remove();
        list.selectedIndex = 0;
        list.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else {
      expenseArr = expenseArr.filter((item) => item.id !== id);
      tableWrapper.remove();
      selectedOption.remove();
      if (list.options.length === 1) {
        currentCatCard.remove();
        removeCategoryOptions(category);
      } else {
        viewBtn.disabled = false;
        delBtn.disabled = false;
        editBtn.disabled = false;
        list.disabled = false;
        list.selectedIndex = 0;
        list.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    setLocal("expense", expenseArr);
    updateUI();
  } else {
    return;
  }
}

//view-all card rendered

function renderedViewAllCard(viewAllBtn) {
  const currentCatCard = viewAllBtn.closest(".exp-dis");
  const list = currentCatCard.querySelector(".list");
  const editBtn = currentCatCard.querySelector("#editbtn");
  const deleteBtn = currentCatCard.querySelector("#deletebtn");
  const selectedOption = list.selectedOptions[0];

  let filteredArr = [];
  viewAllBtn.style.visibility = "hidden";

  if (selectedOption.id === "Category-total") {
    filteredArr = expenseArr.filter((item) => {
      return item.category === selectedOption.dataset.category;
    });
  } else {
    filteredArr = expenseArr.filter((item) => {
      return item.id === Number(selectedOption.id);
    });
  }
  list.disabled = true;
  editBtn.disabled = true;
  deleteBtn.disabled = true;
  const card = createViewAllCard(filteredArr, currentCatCard);

  if (card) {
    currentCatCard.after(card);
  }
}

//Function for edit button in Category card

function editExp(editBtn) {
  const isExisted = document.querySelector(".edit-wrapper");
  if (isExisted) {
    alert("Kindly save existing edit");
    return;
  }

  const currentCard = editBtn.closest(".exp-dis");
  const list = currentCard.querySelector("#expenseSelect");
  const deleteBtn = currentCard.querySelector("#deletebtn");
  const viewAllBtn = currentCard.querySelector("#viewbtn");
  const id = list.selectedOptions[0].id;

  if (id === "Category-total") {
    alert("You can't update entire category. Kindly select an expense.");
    return;
  }

  const item = expenseArr.find((item) => item.id == id);

  list.disabled = true;
  deleteBtn.disabled = true;
  viewAllBtn.disabled = true;
  const card = createEditCard(item, {
    type: "category",
    currentCard: currentCard,
  });

  if (card) {
    currentCard.after(card);
  }
}

//Create edit card

function createEditCard(item, context) {
  const isExisted = document.querySelector(".edit-wrapper");
  if (isExisted) {
    alert("Kindly save an existing edit!");
    return;
  }
  const editWrapper = document.createElement("div"); //parent
  editWrapper.className = "edit-wrapper";

  const editdiv = document.createElement("div"); //child 1
  editdiv.className = "edit-amt-name";

  const editTitleDiv = document.createElement("div"); //sub child 1
  editTitleDiv.className = "edit-title-group";
  const pTitle = document.createElement("p");
  pTitle.className = "edit-label";
  pTitle.innerText = "Edit Title:";
  const editTitle = document.createElement("input");
  editTitle.className = "edit-inp";
  editTitle.id = "edit-title";
  editTitle.type = "text";
  editTitle.value = item.title;
  editTitleDiv.appendChild(pTitle);
  editTitleDiv.appendChild(editTitle);
  editdiv.appendChild(editTitleDiv);

  const editAmtDiv = document.createElement("div"); //sub child 2
  editAmtDiv.className = "edit-amount-group";
  const pAmt = document.createElement("p");
  pAmt.className = "edit-label";
  pAmt.innerText = "Edit Amount:";
  const editAmt = document.createElement("input");
  editAmt.className = "edit-inp";
  editAmt.id = "edit-amount";
  editAmt.type = "number";
  editAmt.value = item.expense;
  editAmtDiv.appendChild(pAmt);
  editAmtDiv.appendChild(editAmt);
  editdiv.appendChild(editAmtDiv);

  editWrapper.appendChild(editdiv);

  const optionsDiv = document.createElement("div"); //child 2
  optionsDiv.className = "edit-options";

  const saveBtn = document.createElement("button"); //sub child 1
  saveBtn.className = "saveedit-btn";
  saveBtn.type = "button";
  saveBtn.id = "save-btn";

  const SaveImg = document.createElement("img");
  SaveImg.className = "edit-icons";
  SaveImg.src = "./assets/save.png";
  SaveImg.alt = "save Butoon";
  saveBtn.appendChild(SaveImg);
  optionsDiv.appendChild(saveBtn);

  const cancelBtn = document.createElement("button");
  cancelBtn.id = "cancelEdit";
  cancelBtn.className = "canceledit-btn";
  cancelBtn.type = "button";

  const cancelImg = document.createElement("img");
  cancelImg.className = "edit-icons";
  cancelImg.src = "./assets/cancel.png";
  cancelImg.alt = "save Butoon";
  cancelBtn.appendChild(cancelImg);
  optionsDiv.appendChild(cancelBtn);

  const delBtn = document.createElement("button");
  delBtn.id = "delEdit";
  delBtn.className = "deledit-btn";
  delBtn.type = "button";

  const delImg = document.createElement("img");
  delImg.className = "edit-icons";
  delImg.src = "./assets/delete.png";
  delImg.alt = "delete icon";
  delBtn.appendChild(delImg);
  optionsDiv.appendChild(delBtn);

  editWrapper.appendChild(optionsDiv);
  attactEvtOnEditCard(editWrapper, context);
  return editWrapper;
}

//Event on Edit card

function attactEvtOnEditCard(editWrapper, context) {
  editWrapper.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("#save-btn");
    const delBtn = e.target.closest("#delEdit");
    const cancleBtn = e.target.closest("#cancelEdit");

    if (saveBtn) {
      saveEdit(editWrapper, context);
    } else if (cancleBtn) {
      cancelEdit(editWrapper, context);
    } else if (delBtn) {
      deleteEdit(delBtn);
    }
  });
}

//function on save button in Edit card

function saveEdit(editWrapper, context) {
  let list, deleteBtn, viewAllBtn;

  if (context.currentCard) {
    list = context.currentCard.querySelector("#expenseSelect");
    deleteBtn = context.currentCard.querySelector("#deletebtn");
    viewAllBtn = context.currentCard.querySelector("#viewbtn");
  }

  const editTitleInp = editWrapper.querySelector("#edit-title");
  const editAmtInp = editWrapper.querySelector("#edit-amount");
  const title = editTitleInp.value;
  const amount = Number(editAmtInp.value);

  if (title.trim() === "" || !Number.isFinite(amount) || amount <= 0) {
    return;
  }

  const confirmation = confirm("Do you want to save changes");

  const findItem = (id) => {
    return expenseArr.find((element) => {
      return element.id === Number(id);
    });
  };

  if (confirmation) {
    let item = null;
    if (context.type === "category") {
      const selectedOption = list.selectedOptions[0];
      const id = selectedOption.id;
      item = findItem(id);
      if (!item) return;
      selectedOption.innerText = title;
      list.disabled = false;
      viewAllBtn.disabled = false;
      deleteBtn.disabled = false;
    } else {
      const rowTitle = context.row.querySelector("[data-field='title']");
      const rowAmount = context.row.querySelector("[data-field='amount']");
      const id = context.row.dataset.id;
      item = findItem(id);
      if (list) {
        const selectedOption = list.querySelector(`[id='${id}']`);
        selectedOption.innerText = title;
      }
      if (!item) return;
      rowTitle.innerText = title;
      rowAmount.innerText = amount;
    }

    item.title = title;
    item.expense = amount;
    setLocal("expense", expenseArr);
    if (list) {
      list.dispatchEvent(new Event("change", { bubbles: true }));
    }

    editWrapper.remove();
    updateUI();
  }
}

//function on cancel button in Edit card

function cancelEdit(editWrapper, context) {
  if (editWrapper) {
    editWrapper.remove();
  }

  if (context.type === "category") {
    const list = context.currentCard.querySelector("#expenseSelect");
    const deleteBtn = context.currentCard.querySelector("#deletebtn");
    const viewAllBtn = context.currentCard.querySelector("#viewbtn");
    list.disabled = false;
    deleteBtn.disabled = false;
    viewAllBtn.disabled = false;
  }
}

//function for delete button in Edit card  to be removed

function deleteEdit(delBtn) {
  const confirmation = confirm("Do you want to delete this expense");

  if (confirmation) {
    expenseArr = expenseArr.filter((element) => element.id !== editId);

    setLocal("expense", expenseArr);
    editId = null;
    updateUI();
  }
}

//Event on delete button in category expense card

function deleteExp(delBtn) {
  const wrapper = delBtn.closest(".exp-dis");
  const list = wrapper.querySelector("#expenseSelect");
  const selectedOption = list.selectedOptions[0];
  if (selectedOption.id === "Category-total") {
    delCategory(list, selectedOption, wrapper);
  } else {
    delSingleExp(list, selectedOption, wrapper);
  }
}

function delCategory(list, selectedOption, wrapper) {
  if (confirm("Are you sure you want to delete this entire category")) {
    expenseArr = expenseArr.filter(
      (item) => item.category !== selectedOption.dataset.category,
    );
    wrapper.remove();

    const category = selectedOption.dataset.category;
    removeCategoryOptions(category);
    setLocal("expense", expenseArr);
    updateUI();
  } else {
    return;
  }
}

function delSingleExp(list, selectedOption, wrapper) {
  if (confirm("Are you sure you want to delete this expense")) {
    expenseArr = expenseArr.filter(
      (item) => item.id !== Number(selectedOption.id),
    );
    const category = selectedOption.dataset.category;
    selectedOption.remove();
    if (list.options.length === 1) {
      wrapper.remove();
      removeCategoryOptions(category);
    } else {
      list.selectedIndex = 0;
      list.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setLocal("expense", expenseArr);
    updateUI();
  } else {
    return;
  }
}

//function to remove option from Select

function removeCategoryOptions(category) {
  const catFilterOptions = categoryFilt.querySelector(
    `option[value="${category}"]`,
  );
  const chartFilterOptions = categoryChart.querySelector(
    `option[value="${category}"]`,
  );

  if (catFilterOptions) {
    catFilterOptions.remove();
  }

  if (chartFilterOptions) {
    chartFilterOptions.remove();
  }
}
