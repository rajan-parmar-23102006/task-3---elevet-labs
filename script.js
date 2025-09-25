document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bookList = document.getElementById("bookList");
    const bookForm = document.getElementById("bookForm");
    const editForm = document.getElementById("editForm");
    const editModal = document.getElementById("editModal");
    const titleInput = document.getElementById("title");
    const authorInput = document.getElementById("author");
    const editTitleInput = document.getElementById("editTitle");
    const editAuthorInput = document.getElementById("editAuthor");
    const editIdInput = document.getElementById("editId");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const sortSelect = document.getElementById("sortSelect");
    const bookCount = document.getElementById("bookCount");
    const authorCount = document.getElementById("authorCount");
    const emptyState = document.getElementById("emptyState");
    const notification = document.getElementById("notification");
    const gridViewBtn = document.getElementById("gridView");
    const listViewBtn = document.getElementById("listView");
    const closeModal = document.querySelector(".close");
    const cancelEditBtn = document.getElementById("cancelEdit");

    // State
    let books = [];
    let filteredBooks = [];
    let currentView = 'grid';

    // Initialize
    fetchBooks();
    setupEventListeners();

    function setupEventListeners() {
        // Form submissions
        bookForm.addEventListener("submit", handleAddBook);
        editForm.addEventListener("submit", handleEditBook);

        // Search and sort
        searchBtn.addEventListener("click", handleSearch);
        searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") handleSearch();
        });
        sortSelect.addEventListener("change", handleSort);

        // View toggle
        gridViewBtn.addEventListener("click", () => setView('grid'));
        listViewBtn.addEventListener("click", () => setView('list'));

        // Modal controls
        closeModal.addEventListener("click", closeEditModal);
        cancelEditBtn.addEventListener("click", closeEditModal);
        window.addEventListener("click", (e) => {
            if (e.target === editModal) closeEditModal();
        });
    }

    // API Functions
    async function fetchBooks() {
        try {
            const res = await fetch("/api/books");
            if (!res.ok) throw new Error("Failed to fetch books");
            books = await res.json();
            filteredBooks = [...books];
            renderBooks();
            updateStats();
        } catch (error) {
            showNotification("Error loading books", "error");
            console.error(error);
        }
    }

    async function addBook(book) {
        try {
            const res = await fetch("/api/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(book)
            });
            if (!res.ok) throw new Error("Failed to add book");
            const newBook = await res.json();
            books.push(newBook);
            filteredBooks = [...books];
            renderBooks();
            updateStats();
            showNotification("Book added successfully!", "success");
            return true;
        } catch (error) {
            showNotification("Error adding book", "error");
            console.error(error);
            return false;
        }
    }

    async function updateBook(id, updatedBook) {
        try {
            const res = await fetch(`/api/books/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedBook)
            });
            if (!res.ok) throw new Error("Failed to update book");
            const book = await res.json();
            const index = books.findIndex(b => b.id === id);
            if (index !== -1) {
                books[index] = book;
                filteredBooks = [...books];
                renderBooks();
                showNotification("Book updated successfully!", "success");
            }
            return true;
        } catch (error) {
            showNotification("Error updating book", "error");
            console.error(error);
            return false;
        }
    }

    async function deleteBook(id) {
        try {
            const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete book");
            books = books.filter(b => b.id !== id);
            filteredBooks = [...books];
            renderBooks();
            updateStats();
            showNotification("Book deleted successfully!", "info");
            return true;
        } catch (error) {
            showNotification("Error deleting book", "error");
            console.error(error);
            return false;
        }
    }

    // Event Handlers
    async function handleAddBook(e) {
        e.preventDefault();
        const newBook = {
            title: titleInput.value.trim(),
            author: authorInput.value.trim()
        };

        if (!newBook.title || !newBook.author) {
            showNotification("Please fill in all fields", "error");
            return;
        }

        const success = await addBook(newBook);
        if (success) {
            titleInput.value = "";
            authorInput.value = "";
        }
    }

    async function handleEditBook(e) {
        e.preventDefault();
        const id = parseInt(editIdInput.value);
        const updatedBook = {
            title: editTitleInput.value.trim(),
            author: editAuthorInput.value.trim()
        };

        if (!updatedBook.title || !updatedBook.author) {
            showNotification("Please fill in all fields", "error");
            return;
        }

        const success = await updateBook(id, updatedBook);
        if (success) {
            closeEditModal();
        }
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            filteredBooks = [...books];
        } else {
            filteredBooks = books.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query)
            );
        }
        renderBooks();
    }

    function handleSort() {
        const [field, direction] = sortSelect.value.split('-');

        filteredBooks.sort((a, b) => {
            const valueA = a[field].toLowerCase();
            const valueB = b[field].toLowerCase();

            if (direction === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });

        renderBooks();
    }

    function setView(view) {
        currentView = view;
        if (view === 'grid') {
            bookList.classList.remove('list-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            bookList.classList.add('list-view');
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
        }
    }

    // UI Functions
    function renderBooks() {
        bookList.innerHTML = "";

        if (filteredBooks.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        filteredBooks.forEach(book => {
            const bookItem = document.createElement("div");
            bookItem.className = "book-item";
            bookItem.innerHTML = `
                <div class="book-title">${book.title}</div>
                <div class="book-author">
                    <i class="fas fa-user"></i> ${book.author}
                </div>
                <div class="book-actions">
                    <button class="edit-btn" onclick="openEditModal(${book.id}, '${book.title.replace(/'/g, "\\'")}', '${book.author.replace(/'/g, "\\'")}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="confirmDelete(${book.id})">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;
            bookList.appendChild(bookItem);
        });
    }

    function updateStats() {
        bookCount.textContent = books.length;

        // Count unique authors
        const uniqueAuthors = new Set(books.map(book => book.author));
        authorCount.textContent = uniqueAuthors.size;
    }

    function openEditModal(id, title, author) {
        editIdInput.value = id;
        editTitleInput.value = title;
        editAuthorInput.value = author;
        editModal.style.display = "block";
    }

    function closeEditModal() {
        editModal.style.display = "none";
    }

    function confirmDelete(id) {
        const book = books.find(b => b.id === id);
        if (book && confirm(`Are you sure you want to delete "${book.title}"?`)) {
            deleteBook(id);
        }
    }

    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add("show");

        setTimeout(() => {
            notification.classList.remove("show");
        }, 3000);
    }

    // Global functions for onclick handlers
    window.openEditModal = openEditModal;
    window.confirmDelete = confirmDelete;
});