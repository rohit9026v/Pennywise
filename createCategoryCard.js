const createCategoryCard = (category, amt, time, expenseArr) => {
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
  renderOptCategory(list, category, expenseArr);
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
  amtPara.innerText = `₹ ${amt.toFixed(2)}`;
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
};

function renderOptCategory(appendto, category,expenseArr) {
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

export default createCategoryCard;
