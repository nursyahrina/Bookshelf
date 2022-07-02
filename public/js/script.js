const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'RUBIES_BOOKSHELF_APPS';

let keyword = '';

document.addEventListener('DOMContentLoaded', function () {
  const insertForm = document.getElementById('insert-form');
  insertForm.addEventListener('submit', function (event) {
    event.preventDefault();
    insertBook();
  });

  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const unfinishedBookList = document.getElementById('unfinished-list');
  unfinishedBookList.innerHTML = '';

  const finishedBookList = document.getElementById('finished-list');
  finishedBookList.innerHTML = '';
 
  for (const book of books) {
    const bookElement = makeBook(book);
    if (!book.isComplete)
      unfinishedBookList.append(bookElement);
    else
      finishedBookList.append(bookElement);
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
  showNotification();
});

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Your browser doesn\'t support local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage(keyword = '') {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      console.log(keyword);
      console.log(book.title.includes(keyword));
      if (book.title.includes(keyword)) {
        books.push(book);
      }
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function insertBook() {
  const bookTitle = document.getElementById('new-title').value;
  const bookAuthor = document.getElementById('new-author').value;
  const bookYear = document.getElementById('new-year').value;
  const bookIsComplete = document.getElementById('new-iscomplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
  books.push(bookObject);
 
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBook() {
  keyword = document.getElementById('search-title').value;

  if (isStorageExist()) {
    books.splice(0,books.length);
    loadDataFromStorage(keyword);
  }
}

function generateId() {
  return +new Date();
}
 
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

function makeBook(bookObject) {
  const bookTitle = document.createElement('h3');
  bookTitle.className += 'text-lg font-bold';
  bookTitle.innerText = bookObject.title;
 
  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = 'Author: ' + bookObject.author;

  const bookYear = document.createElement('p');
  bookYear.innerText = 'Year: ' + bookObject.year;
 
  const section = document.createElement('section');
  section.className += 'my-2 px-4 p-2 rounded-lg bg-white';
  section.append(bookTitle, bookAuthor, bookYear);
  section.setAttribute('id', `book-${bookObject.id}`);

  const buttonsDiv = document.createElement('div');
  buttonsDiv.className += 'my-2';

  if (bookObject.isComplete) {
    const cancelFinishButton = document.createElement('button');
    cancelFinishButton.className += 'rounded-lg bg-amber-500 mb-1 px-2 py-1 text-white text-sm';
    cancelFinishButton.innerText = 'Cancel Finish';
 
    cancelFinishButton.addEventListener('click', function () {
      cancelBookFromFinished(bookObject.id);
    });
 
    buttonsDiv.append(cancelFinishButton);
  } else {
    const finishButton = document.createElement('button');
    finishButton.className += 'rounded-lg bg-emerald-500 mb-1 px-2 py-1 text-white text-sm';
    finishButton.innerText = 'Finish Reading';

    finishButton.addEventListener('click', function () {
      addBookToFinished(bookObject.id);
    });
    
    buttonsDiv.append(finishButton);
  }

  const trashButton = document.createElement('button');
  trashButton.className += 'rounded-lg bg-rose-600 mb-1 ml-1 px-2 py-1 text-white text-sm';
  trashButton.innerText = 'Remove Book';

  trashButton.addEventListener('click', function () {
    showRemoveConfirmation(bookObject.id);
  });

  buttonsDiv.append(trashButton);
  section.append(buttonsDiv);
 
  return section;
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
 
  return -1;
}

function addBookToFinished(bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
 
function removeBookFromList(bookId) {
  const bookTarget = findBookIndex(bookId);
 
  if (bookTarget === -1) return;
 
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
 
function cancelBookFromFinished(bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function showNotification() {
  var notification = document.getElementById('save-notif');
  notification.classList.remove('hidden');
  notification.classList.add('fixed');
  setTimeout(function(){ notification.className = notification.className.replace('fixed', 'hidden'); }, 2000);
}

function showRemoveConfirmation(bookId) {
  var confirmation = document.getElementById('remove-confirm');
  confirmation.classList.remove('hidden');
  confirmation.classList.add('fixed');

  var bookTitle = document.getElementById('remove-title');
  bookTitle.innerText = findBook(bookId).title;

  var confirmRemove = document.getElementById('confirm-remove');
  confirmRemove.addEventListener('click', function () {
    confirmation.classList.remove('fixed');
    confirmation.classList.add('hidden');
    removeBookFromList(bookId);
  });

  var confirmCancel = document.getElementById('confirm-cancel');
  confirmCancel.addEventListener('click', function () {
    confirmation.classList.remove('fixed');
    confirmation.classList.add('hidden');
  });
}
