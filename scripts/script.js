const isLoginPage = window.location.pathname.includes("login.html");
const isLoggedIn = localStorage.getItem("lms_logged_in") === "true";

if (isLoginPage) {
  if (isLoggedIn) {
    window.location.href = "index.html";
  }
} else {
  if (!isLoggedIn) {
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (isLoginPage) {
    initLoginLogic();
  } else {
    initAppLogic();
  }
});

function initLoginLogic() {
  const loginForm = document.getElementById("login-form");
  const eye = document.querySelector(".eye");
  const passwordInput = document.getElementById("password");
  const errorDiv = document.getElementById("error-message");

  if (eye && passwordInput) {
    eye.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eye.classList.remove("ri-eye-line");
        eye.classList.add("ri-eye-off-line");
      } else {
        passwordInput.type = "password";
        eye.classList.remove("ri-eye-off-line");
        eye.classList.add("ri-eye-line");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = passwordInput.value;

      if (!validatePassword(password)) {
        errorDiv.textContent = "Password must be at least 8 characters long, contain a capital letter, and a special character.";
        errorDiv.style.display = "block";
        return;
      }

      if (email === "admin@lms.com" && password === "Admin123!") {
        localStorage.setItem("lms_logged_in", "true");
        localStorage.setItem("lms_user", email);
        window.location.href = "index.html";
      } else if (email !== "" && validatePassword(password)) {
        localStorage.setItem("lms_logged_in", "true");
        localStorage.setItem("lms_user", email);
        window.location.href = "index.html";
      } else {
        errorDiv.textContent = "Invalid login credentials.";
        errorDiv.style.display = "block";
      }
    });
  }
}

function validatePassword(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

function initAppLogic() {
  initDatabase();
  switchSection("dashboard");
  loadStatistics();
  renderActivities();
}

function initDatabase() {
  if (!localStorage.getItem("lms_books")) {
    const defaultBooks = [
      { id: "B1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565", category: "Fiction", quantity: 5, available: 4 },
      { id: "B2", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", category: "Fiction", quantity: 3, available: 3 },
      { id: "B3", title: "1984", author: "George Orwell", isbn: "9780451524935", category: "Sci-Fi", quantity: 4, available: 3 },
      { id: "B4", title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", category: "Science", quantity: 2, available: 2 }
    ];
    localStorage.setItem("lms_books", JSON.stringify(defaultBooks));
  }

  if (!localStorage.getItem("lms_members")) {
    const defaultMembers = [
      { id: "M1", name: "John Doe", email: "john@gmail.com", phone: "9876543210", status: "Active" },
      { id: "M2", name: "Jane Smith", email: "jane@gmail.com", phone: "9812345670", status: "Active" },
      { id: "M3", name: "Bob Johnson", email: "bob@gmail.com", phone: "9845678901", status: "Suspended" }
    ];
    localStorage.setItem("lms_members", JSON.stringify(defaultMembers));
  }

  if (!localStorage.getItem("lms_issues")) {
    const defaultIssues = [
      { id: "I1", memberId: "M1", memberName: "John Doe", bookId: "B3", bookTitle: "1984", issueDate: "2026-06-01", dueDate: "2026-06-15", returnDate: null, status: "Issued" },
      { id: "I2", memberId: "M2", memberName: "Jane Smith", bookId: "B1", bookTitle: "The Great Gatsby", issueDate: "2026-06-10", dueDate: "2026-06-24", returnDate: null, status: "Issued" },
      { id: "I3", memberId: "M3", memberName: "Bob Johnson", bookId: "B3", bookTitle: "1984", issueDate: "2026-05-20", dueDate: "2026-06-03", returnDate: "2026-06-02", status: "Returned" }
    ];
    localStorage.setItem("lms_issues", JSON.stringify(defaultIssues));
  }

  if (!localStorage.getItem("lms_activities")) {
    const defaultActivities = [
      { text: "System database initialized with mock records", time: "2026-06-16 09:00" },
      { text: "John Doe borrowed 1984", time: "2026-06-01 10:15" },
      { text: "Bob Johnson returned 1984", time: "2026-06-02 14:30" }
    ];
    localStorage.setItem("lms_activities", JSON.stringify(defaultActivities));
  }
}

function hamMenu() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.toggle("collapsed");
  }
}

function toggleMobileMenu() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.toggle("active");
  }
}

let activeSectionId = "dashboard";

function switchSection(sectionId) {
  activeSectionId = sectionId;
  const sections = document.querySelectorAll(".content-section");
  sections.forEach(sec => sec.style.display = "none");

  const activeSec = document.getElementById(`${sectionId}-section`);
  if (activeSec) {
    activeSec.style.display = "flex";
  }

  const navLinks = document.querySelectorAll("ul a");
  navLinks.forEach(link => link.classList.remove("active"));

  const activeLink = document.getElementById(`nav-${sectionId}`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.remove("active");
  }

  const headerTitle = document.getElementById("header-title");
  if (headerTitle) {
    const titleMap = {
      dashboard: "Dashboard",
      books: "Books Directory",
      members: "Members Directory",
      issued: "Currently Issued Books",
      borrowed: "Borrowing Transactions Log",
      overdue: "Overdue Returns"
    };
    headerTitle.textContent = titleMap[sectionId] || "LMS";
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
  }

  if (sectionId === "dashboard") {
    loadStatistics();
    renderActivities();
  } else if (sectionId === "books") {
    renderBooks();
  } else if (sectionId === "members") {
    renderMembers();
  } else if (sectionId === "issued") {
    renderIssued();
  } else if (sectionId === "borrowed") {
    renderBorrowed();
  } else if (sectionId === "overdue") {
    renderOverdue();
  }
}

function getTodayString() {
  return "2026-06-16";
}

function getTimeString() {
  return "13:20";
}

function loadStatistics() {
  const books = JSON.parse(localStorage.getItem("lms_books") || "[]");
  const members = JSON.parse(localStorage.getItem("lms_members") || "[]");
  const issues = JSON.parse(localStorage.getItem("lms_issues") || "[]");

  const totalBooks = books.reduce((acc, curr) => acc + parseInt(curr.quantity || 0), 0);
  const totalMembers = members.length;
  const activeIssues = issues.filter(iss => iss.status === "Issued").length;

  const todayStr = getTodayString();
  const overdueCount = issues.filter(iss => iss.status === "Issued" && iss.dueDate < todayStr).length;

  document.getElementById("stat-total-books").textContent = totalBooks;
  document.getElementById("stat-total-members").textContent = totalMembers;
  document.getElementById("stat-issued-books").textContent = activeIssues;
  document.getElementById("stat-overdue-books").textContent = overdueCount;
}

function logActivity(text) {
  const activities = JSON.parse(localStorage.getItem("lms_activities") || "[]");
  const dateStr = getTodayString();
  const timeStr = getTimeString();
  activities.unshift({ text, time: `${dateStr} ${timeStr}` });
  if (activities.length > 8) {
    activities.pop();
  }
  localStorage.setItem("lms_activities", JSON.stringify(activities));
}

function renderActivities() {
  const list = document.getElementById("activity-list");
  if (!list) return;
  const activities = JSON.parse(localStorage.getItem("lms_activities") || "[]");
  list.innerHTML = "";

  if (activities.length === 0) {
    list.innerHTML = `<div class="activity-text">No recent activity.</div>`;
    return;
  }

  activities.forEach(act => {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
      <div class="activity-icon">
        <i class="ri-history-line"></i>
      </div>
      <div class="activity-info">
        <div class="activity-text">${act.text}</div>
        <div class="activity-time">${act.time}</div>
      </div>
    `;
    list.appendChild(item);
  });
}

function triggerSearch() {
  const term = document.getElementById("search-input").value.toLowerCase().trim();
  if (activeSectionId === "books") {
    renderBooks(term);
  } else if (activeSectionId === "members") {
    renderMembers(term);
  } else if (activeSectionId === "issued") {
    renderIssued(term);
  } else if (activeSectionId === "borrowed") {
    renderBorrowed(term);
  } else if (activeSectionId === "overdue") {
    renderOverdue(term);
  }
}

function renderBooks(filter = "") {
  const tbody = document.getElementById("books-table-body");
  if (!tbody) return;
  const books = JSON.parse(localStorage.getItem("lms_books") || "[]");
  tbody.innerHTML = "";

  const filtered = books.filter(b => 
    b.title.toLowerCase().includes(filter) ||
    b.author.toLowerCase().includes(filter) ||
    b.isbn.toLowerCase().includes(filter) ||
    b.category.toLowerCase().includes(filter)
  );

  filtered.forEach(b => {
    const isAvail = b.available > 0;
    const badgeClass = isAvail ? "badge-success" : "badge-danger";
    const badgeText = isAvail ? `Available (${b.available}/${b.quantity})` : `Out of Stock (0/${b.quantity})`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${b.title}</strong></td>
      <td>${b.author}</td>
      <td>${b.isbn}</td>
      <td>${b.category}</td>
      <td><span class="badge ${badgeClass}">${badgeText}</span></td>
      <td>
        <button class="btn-edit" onclick="openBookModal('${b.id}')">Edit</button>
        <button class="btn-danger" onclick="deleteBook('${b.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openBookModal(id = "") {
  const modal = document.getElementById("book-modal");
  const form = document.getElementById("book-form");
  const title = document.getElementById("book-modal-title");
  
  form.reset();
  document.getElementById("book-form-id").value = id;

  if (id) {
    title.textContent = "Edit Book";
    const books = JSON.parse(localStorage.getItem("lms_books") || "[]");
    const book = books.find(b => b.id === id);
    if (book) {
      document.getElementById("book-title").value = book.title;
      document.getElementById("book-author").value = book.author;
      document.getElementById("book-isbn").value = book.isbn;
      document.getElementById("book-category").value = book.category;
      document.getElementById("book-quantity").value = book.quantity;
    }
  } else {
    title.textContent = "Add New Book";
  }
  modal.showModal();
}

function closeBookModal() {
  document.getElementById("book-modal").close();
}

function saveBook(e) {
  e.preventDefault();
  const id = document.getElementById("book-form-id").value;
  const title = document.getElementById("book-title").value.trim();
  const author = document.getElementById("book-author").value.trim();
  const isbn = document.getElementById("book-isbn").value.trim();
  const category = document.getElementById("book-category").value.trim();
  const quantityVal = parseInt(document.getElementById("book-quantity").value);

  let books = JSON.parse(localStorage.getItem("lms_books") || "[]");

  if (id) {
    const book = books.find(b => b.id === id);
    if (book) {
      const diff = quantityVal - book.quantity;
      book.title = title;
      book.author = author;
      book.isbn = isbn;
      book.category = category;
      book.quantity = quantityVal;
      book.available = Math.max(0, book.available + diff);
      logActivity(`Updated book: ${title}`);
    }
  } else {
    const newId = "B" + (Date.now());
    books.push({
      id: newId,
      title,
      author,
      isbn,
      category,
      quantity: quantityVal,
      available: quantityVal
    });
    logActivity(`Added new book: ${title}`);
  }

  localStorage.setItem("lms_books", JSON.stringify(books));
  closeBookModal();
  renderBooks();
  loadStatistics();
}

function deleteBook(id) {
  if (!confirm("Are you sure you want to delete this book?")) return;
  let books = JSON.parse(localStorage.getItem("lms_books") || "[]");
  const book = books.find(b => b.id === id);
  if (book) {
    books = books.filter(b => b.id !== id);
    localStorage.setItem("lms_books", JSON.stringify(books));
    logActivity(`Deleted book: ${book.title}`);
    renderBooks();
    loadStatistics();
  }
}

function renderMembers(filter = "") {
  const tbody = document.getElementById("members-table-body");
  if (!tbody) return;
  const members = JSON.parse(localStorage.getItem("lms_members") || "[]");
  tbody.innerHTML = "";

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(filter) ||
    m.email.toLowerCase().includes(filter) ||
    m.phone.includes(filter) ||
    m.id.toLowerCase().includes(filter)
  );

  filtered.forEach(m => {
    const badgeClass = m.status === "Active" ? "badge-success" : "badge-danger";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><code>${m.id}</code></td>
      <td><strong>${m.name}</strong></td>
      <td>${m.email}</td>
      <td>${m.phone}</td>
      <td><span class="badge ${badgeClass}">${m.status}</span></td>
      <td>
        <button class="btn-edit" onclick="openMemberModal('${m.id}')">Edit</button>
        <button class="btn-danger" onclick="deleteMember('${m.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openMemberModal(id = "") {
  const modal = document.getElementById("member-modal");
  const form = document.getElementById("member-form");
  const title = document.getElementById("member-modal-title");

  form.reset();
  document.getElementById("member-form-id").value = id;

  if (id) {
    title.textContent = "Edit Member";
    const members = JSON.parse(localStorage.getItem("lms_members") || "[]");
    const m = members.find(mem => mem.id === id);
    if (m) {
      document.getElementById("member-name").value = m.name;
      document.getElementById("member-email").value = m.email;
      document.getElementById("member-phone").value = m.phone;
    }
  } else {
    title.textContent = "Add New Member";
  }
  modal.showModal();
}

function closeMemberModal() {
  document.getElementById("member-modal").close();
}

function saveMember(e) {
  e.preventDefault();
  const id = document.getElementById("member-form-id").value;
  const name = document.getElementById("member-name").value.trim();
  const email = document.getElementById("member-email").value.trim();
  const phone = document.getElementById("member-phone").value.trim();

  let members = JSON.parse(localStorage.getItem("lms_members") || "[]");

  if (id) {
    const m = members.find(mem => mem.id === id);
    if (m) {
      m.name = name;
      m.email = email;
      m.phone = phone;
      logActivity(`Updated member record: ${name}`);
    }
  } else {
    const newId = "M" + (Date.now() % 10000);
    members.push({
      id: newId,
      name,
      email,
      phone,
      status: "Active"
    });
    logActivity(`Registered new member: ${name}`);
  }

  localStorage.setItem("lms_members", JSON.stringify(members));
  closeMemberModal();
  renderMembers();
  loadStatistics();
}

function deleteMember(id) {
  if (!confirm("Are you sure you want to delete this member?")) return;
  let members = JSON.parse(localStorage.getItem("lms_members") || "[]");
  const m = members.find(mem => mem.id === id);
  if (m) {
    members = members.filter(mem => mem.id !== id);
    localStorage.setItem("lms_members", JSON.stringify(members));
    logActivity(`Deleted member record: ${m.name}`);
    renderMembers();
    loadStatistics();
  }
}

function renderIssued(filter = "") {
  const tbody = document.getElementById("issued-table-body");
  if (!tbody) return;
  const issues = JSON.parse(localStorage.getItem("lms_issues") || "[]");
  tbody.innerHTML = "";

  const activeIssues = issues.filter(iss => iss.status === "Issued");
  const filtered = activeIssues.filter(iss => 
    iss.bookTitle.toLowerCase().includes(filter) ||
    iss.memberName.toLowerCase().includes(filter)
  );

  const todayStr = getTodayString();

  filtered.forEach(iss => {
    const isOverdue = iss.dueDate < todayStr;
    const badgeClass = isOverdue ? "badge-danger" : "badge-success";
    const badgeText = isOverdue ? "Overdue" : "Active";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${iss.bookTitle}</strong></td>
      <td>${iss.memberName} (ID: ${iss.memberId})</td>
      <td>${iss.issueDate}</td>
      <td>${iss.dueDate}</td>
      <td><span class="badge ${badgeClass}">${badgeText}</span></td>
      <td>
        <button class="btn-edit" onclick="returnBook('${iss.id}')">Return</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openIssueModal() {
  const modal = document.getElementById("issue-modal");
  const bookSelect = document.getElementById("issue-book-select");
  const memberSelect = document.getElementById("issue-member-select");

  bookSelect.innerHTML = "";
  memberSelect.innerHTML = "";

  const books = JSON.parse(localStorage.getItem("lms_books") || "[]");
  const members = JSON.parse(localStorage.getItem("lms_members") || "[]");

  const availableBooks = books.filter(b => b.available > 0);
  const activeMembers = members.filter(m => m.status === "Active");

  if (availableBooks.length === 0) {
    alert("No books are currently available for issue.");
    return;
  }
  if (activeMembers.length === 0) {
    alert("No active members found to issue books to.");
    return;
  }

  availableBooks.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = `${b.title} (ISBN: ${b.isbn})`;
    bookSelect.appendChild(opt);
  });

  activeMembers.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.name} (ID: ${m.id})`;
    memberSelect.appendChild(opt);
  });

  const today = getTodayString();
  const dueDateObj = new Date("2026-06-16");
  dueDateObj.setDate(dueDateObj.getDate() + 14);
  const dueStr = dueDateObj.toISOString().split("T")[0];

  document.getElementById("issue-date").value = today;
  document.getElementById("issue-due-date").value = dueStr;

  modal.showModal();
}

function closeIssueModal() {
  document.getElementById("issue-modal").close();
}

function issueBookSubmit(e) {
  e.preventDefault();
  const bookId = document.getElementById("issue-book-select").value;
  const memberId = document.getElementById("issue-member-select").value;
  const issueDate = document.getElementById("issue-date").value;
  const dueDate = document.getElementById("issue-due-date").value;

  let books = JSON.parse(localStorage.getItem("lms_books") || "[]");
  let members = JSON.parse(localStorage.getItem("lms_members") || "[]");
  let issues = JSON.parse(localStorage.getItem("lms_issues") || "[]");

  const book = books.find(b => b.id === bookId);
  const member = members.find(m => m.id === memberId);

  if (book && member) {
    if (book.available <= 0) {
      alert("Selected book is currently out of stock.");
      return;
    }

    book.available--;
    const newIssueId = "I" + Date.now();
    issues.push({
      id: newIssueId,
      memberId: member.id,
      memberName: member.name,
      bookId: book.id,
      bookTitle: book.title,
      issueDate,
      dueDate,
      returnDate: null,
      status: "Issued"
    });

    localStorage.setItem("lms_books", JSON.stringify(books));
    localStorage.setItem("lms_issues", JSON.stringify(issues));

    logActivity(`${member.name} borrowed ${book.title}`);
    closeIssueModal();
    renderIssued();
    loadStatistics();
  }
}

function returnBook(issueId) {
  let issues = JSON.parse(localStorage.getItem("lms_issues") || "[]");
  let books = JSON.parse(localStorage.getItem("lms_books") || "[]");

  const issue = issues.find(iss => iss.id === issueId);
  if (issue) {
    issue.status = "Returned";
    issue.returnDate = getTodayString();

    const book = books.find(b => b.id === issue.bookId);
    if (book) {
      book.available = Math.min(book.quantity, book.available + 1);
    }

    localStorage.setItem("lms_issues", JSON.stringify(issues));
    localStorage.setItem("lms_books", JSON.stringify(books));

    logActivity(`${issue.memberName} returned ${issue.bookTitle}`);
    
    if (activeSectionId === "issued") renderIssued();
    else if (activeSectionId === "overdue") renderOverdue();
    else if (activeSectionId === "dashboard") {
      loadStatistics();
      renderActivities();
    }
  }
}

function renderBorrowed(filter = "") {
  const tbody = document.getElementById("borrowed-table-body");
  if (!tbody) return;
  const issues = JSON.parse(localStorage.getItem("lms_issues") || "[]");
  tbody.innerHTML = "";

  const filtered = issues.filter(iss => 
    iss.bookTitle.toLowerCase().includes(filter) ||
    iss.memberName.toLowerCase().includes(filter)
  );

  filtered.forEach(iss => {
    let badgeClass = "badge-success";
    if (iss.status === "Returned") {
      badgeClass = "badge-success";
    } else {
      const todayStr = getTodayString();
      const isOverdue = iss.dueDate < todayStr;
      badgeClass = isOverdue ? "badge-danger" : "badge-warning";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${iss.bookTitle}</strong></td>
      <td>${iss.memberName} (ID: ${iss.memberId})</td>
      <td>${iss.issueDate}</td>
      <td>${iss.returnDate || "-"}</td>
      <td><span class="badge ${badgeClass}">${iss.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderOverdue(filter = "") {
  const tbody = document.getElementById("overdue-table-body");
  if (!tbody) return;
  const issues = JSON.parse(localStorage.getItem("lms_issues") || "[]");
  tbody.innerHTML = "";

  const todayStr = getTodayString();
  const overdueIssues = issues.filter(iss => iss.status === "Issued" && iss.dueDate < todayStr);

  const filtered = overdueIssues.filter(iss => 
    iss.bookTitle.toLowerCase().includes(filter) ||
    iss.memberName.toLowerCase().includes(filter)
  );

  filtered.forEach(iss => {
    const d1 = new Date(iss.dueDate);
    const d2 = new Date(todayStr);
    const timeDiff = d2.getTime() - d1.getTime();
    const daysLate = Math.floor(timeDiff / (1000 * 3600 * 24));
    const estimatedFine = `$${(daysLate * 1.00).toFixed(2)}`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${iss.bookTitle}</strong></td>
      <td>${iss.memberName} (ID: ${iss.memberId})</td>
      <td>${iss.dueDate}</td>
      <td><span class="badge badge-danger">${daysLate} days</span></td>
      <td><strong style="color: #c81e1e;">${estimatedFine}</strong></td>
      <td>
        <button class="btn-edit" onclick="returnBook('${iss.id}')">Return</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function logout() {
  localStorage.removeItem("lms_logged_in");
  localStorage.removeItem("lms_user");
  window.location.href = "login.html";
}
