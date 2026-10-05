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

//Fn for updating UI

function updateUI() {
  totalExpdis();
  totalEntries();
  monthTExp();
  renderCategories(categoryFilt, true);
  sortBy();
  renderTotChart("bar"); //Total expense chart Updated
  renderCatChart("clothing"); //Category chart Updated
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

//function on upload input

//function on add button

const addSec = document.querySelector("#add-sec");

addButton.addEventListener("click", () => {
  const title = inpTitle.value.trim();
  const expense = Number(inpAmount.value);
  const category = inpCategory.value;
  const time = new Date().toLocaleString();
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

  expenseArr.push({
    id: Date.now(),
    category,
    title,
    expense,
    paymentType,
    time,
    comment,
  });

  setLocal("expense", expenseArr);
  updateUI();
  floatingBtn.classList.remove("hidden"); //floating button visible
  addSec.classList.add("hidden"); //add sec hide
  inpAmount.value = ""; //amount feild set to empty
  inpTitle.value = ""; //title feild set to empty
});

//floating add button

const floatingBtn = document.querySelector("#flot-btn");

floatingBtn.addEventListener("click", () => {
  floatingBtn.classList.add("hidden");
  addSec.classList.remove("hidden");
});

//total expense display

function totalExpdis() {
  let exp = expenseArr.reduce(
    (acc, current) => acc + Number(current.expense),
    0,
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
function renderTotChart(type) {
  const expArr = findTotal();
  drawChart(totalCanvas, type, expArr);
}

renderTotChart("bar");

//dynamic category charts options

const categoryChart = document.querySelector("#category-select");
renderCategories(categoryChart);

//dynamic category chart functinn

const categoryCanvas = document.querySelector("#category-canvas");
function renderCatChart(category) {
  const expArr = expenseArr.filter((item) => item.category === category);
  //Temp fix
  const tempArr = expArr.map((item) => {
    return {
      category: item.title,
      totalExpense: item.expense,
    };
  });
  drawChart(categoryCanvas, "doughnut", tempArr);
}

renderCatChart("clothing");

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
  const value = e.target.value.toLowerCase();
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
      return;
    }
  }, 300);
});

//Event on search button

const searchBtn = document.querySelector("#search-btn");
searchBtn.addEventListener("click", (e) => {
  const searchFeild = e.target
    .closest(".search-div")
    .querySelector("#searchExp");
  let filteredArr = getFilteredArr(searchFeild.value.toLowerCase());
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
  span.innerText = time;
  expenseDetails.appendChild(span);
  categoryAmtDiv.appendChild(expenseDetails); // sub child 1 appended

  const edit = document.createElement("button"); //sub child 2 created
  edit.className = "editExp";
  edit.id = "editbtn";
  const img = document.createElement("img");
  img.src = "./assets/edit.png";
  edit.appendChild(img);
  categoryAmtDiv.appendChild(edit); //sub child 2 appended

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
  categoryAmtDiv.appendChild(deleteDiv); //sub-child 3 appended
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
  timeEl.innerText = time;
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

function createViewAllCard(filteredArr) {
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
    titleTd.dataset.feild = "title";
    bodytr.appendChild(titleTd);

    const amountTd = document.createElement("td");
    amountTd.innerText = item.expense;
    amountTd.dataset.feild = "amount";
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
    editBtn.classList = "viewall-action-btn";
    editBtn.id = "viewall-edit-btn";
    const editImg = document.createElement("img");
    editImg.src = "./assets/edit.png";
    editBtn.appendChild(editImg);
    actionTd.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.classList = "viewall-action-btn";
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
  attachEventOnTable(table);
  wrapperDiv.appendChild(table);
  attachEventOnViewAllCard(wrapperDiv);
  return wrapperDiv;
}

//view-all card rendered

function renderedViewAllCard(btn) {
  const currentCard = btn.closest(".exp-dis");
  const list = currentCard.querySelector(".list");
  const selected = list.selectedOptions[0];
  let filteredArr = [];

  btn.style.visibility = "hidden";

  if (selected.dataset.category) {
    filteredArr = expenseArr.filter((item) => {
      return item.category === selected.dataset.category;
    });
  } else {
    filteredArr = expenseArr.filter((item) => {
      return item.id === Number(selected.id);
    });
  }

  const card = createViewAllCard(filteredArr);

  if (card) {
    currentCard.after(card);
  }
}

//event on button in view all card

function attachEventOnViewAllCard(wrapper) {
  wrapper.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("#viewall-closebtn");
    const printBtn = e.target.closest("#viewall-printbtn");
    const viewBtn = wrapper.previousElementSibling.querySelector("#viewbtn");

    if (!closeBtn && !printBtn) {
      return;
    }

    if (printBtn) {
      window.print();
    } else if (closeBtn) {
      if (viewBtn) {
        viewBtn.style.visibility = "visible";
      }
      wrapper.remove();
    }
  });
}

//event on table action buttons in viewAll Card

function attachEventOnTable(table) {
  table.addEventListener("click", (e) => {
    const editBtn = e.target.closest("#viewall-edit-btn");
    const delBtn = e.target.closest("#viewall-del-btn");

    if (!editBtn && !delBtn) {
      return;
    }

    if (editBtn) {
      editExpRow(editBtn);
    } else if (delBtn) {
      deleteExpRow(delBtn);
    }
  });
}

//Edit function in view all table

let editId = null;
function editExpRow(editBtn) {
  const row = editBtn.closest("tr");
  const amountCell = row.querySelector("[data-feild='amount']");
  const titleCell = row.querySelector("[data-feild='title']");
  const id = Number(row.dataset.id);
  editId = id;
  let currentCard = editBtn.closest(".viewallWrapper");
  const card = createEditCard(
    titleCell.textContent,
    Number(amountCell.textContent),
  );
  if (card) {
    currentCard.after(card);
  }
}

//Delete function in view all table

function deleteExpRow(delBtn) {
  if (confirm("Are you sure! you want to delete this expense?")) {
    const row = delBtn.closest("tr");
    const id = Number(row.dataset.id);
    expenseArr = expenseArr.filter((item) => item.id !== id);
    setLocal("expense", expenseArr);
    updateUI();
  }
}

//Function for edit button in Category card

function editExp(editBtn) {
  const isExisted = document.querySelector(".edit-wrapper");
  if (isExisted) {
    alert("Kindly save existing edit");
    return;
  }

  let currentCard = editBtn.closest(".exp-dis");

  const expItem = currentCard.querySelector(".list");
  if (expItem.selectedOptions[0].id === "Category-total") {
    alert("You can't update entire category. Kindly select an expense.");
    return;
  }

  const item = expenseArr.find(
    (item) => item.id == expItem.selectedOptions[0].id,
  );

  editId = item.id;
  const card = createEditCard(item.title, item.expense);

  if (card) {
    currentCard.after(card);
  }
}

//Create edit card

function createEditCard(title, amount) {
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
  const spanT = document.createElement("span");
  spanT.className = "edit-label";
  spanT.innerText = "Edit Title:";
  const editTitle = document.createElement("input");
  editTitle.className = "edit-inp";
  editTitle.id = "edit-title";
  editTitle.type = "text";
  editTitle.value = title;
  editTitleDiv.appendChild(spanT);
  editTitleDiv.appendChild(editTitle);
  editdiv.appendChild(editTitleDiv);

  const editAmtDiv = document.createElement("div"); //sub child 2
  editAmtDiv.className = "edit-amount-group";
  const spanA = document.createElement("span");
  spanA.innerText = "Edit Amount:";
  const editAmt = document.createElement("input");
  editAmt.className = "edit-inp";
  editAmt.id = "edit-amount";
  editAmt.type = "number";
  editAmt.value = amount;
  editAmtDiv.appendChild(spanA);
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
  attactEvtOnEditCard(editWrapper);
  return editWrapper;
}

//Event on Edit card

function attactEvtOnEditCard(editWrapper) {
  editWrapper.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("#save-btn");
    const delBtn = e.target.closest("#delEdit");
    const cancleBtn = e.target.closest("#cancelEdit");

    if (saveBtn) {
      saveEdit(saveBtn);
    } else if (cancleBtn) {
      cancelEdit(cancleBtn);
    } else if (delBtn) {
      deleteEdit(delBtn);
    }
  });
}

//function on save button in Edit card

function saveEdit(saveBtn) {
  const editTitleInp = saveBtn
    .closest(".edit-wrapper")
    .querySelector("#edit-title");
  const editAmtInp = saveBtn
    .closest(".edit-wrapper")
    .querySelector("#edit-amount");
  const title = editTitleInp.value;
  const amount = Number(editAmtInp.value);

  if (editId === null) {
    return;
  }

  if (title.trim() === "" || !Number.isFinite(amount) || amount <= 0) {
    console.log("this is also runningt");
    return;
  }

  const confirmation = confirm("Do you want to save changes");

  if (confirmation) {
    expenseArr.forEach((element) => {
      if (element.id === editId) {
        element.title = title;
        element.expense = amount;
      }
    });

    setLocal("expense", expenseArr);
    editId = null;
    updateUI();
  }
}

//function on cancel button in Edit card

function cancelEdit(cancelBtn) {
  const editWrapper = cancelBtn.closest(".edit-wrapper");
  if (editWrapper) {
    editWrapper.remove();
  }
}

//function for delete button in Edit card

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
    if (confirm("Are you sure you want to delete this entire category")) {
      expenseArr = expenseArr.filter(
        (item) => item.category !== selectedOption.dataset.category,
      );
    } else {
      return;
    }
  } else {
    if (confirm("Are you sure you want to delete this expense")) {
      expenseArr = expenseArr.filter(
        (item) => item.id !== Number(selectedOption.id),
      );
    } else {
      return;
    }
  }
  //Update amount displayed
  setLocal("expense", expenseArr);
  updateUI();
}
