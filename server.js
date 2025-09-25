const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// In-memory database
let books = [
    { id: 1, title: "The Alchemist", author: "Paulo Coelho" },
    { id: 2, title: "Atomic Habits", author: "James Clear" },
    { id: 3, title: "Dune", author: "Frank Herbert" },
    { id: 4, title: "Neuromancer", author: "William Gibson" }
];

// Routes
app.get("/api/books", (req, res) => res.json(books));

app.post("/api/books", (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: "Title and author are required" });
    }

    const newBook = {
        id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
        title,
        author
    };
    books.push(newBook);
    res.status(201).json(newBook);
});

app.put("/api/books/:id", (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).json({ message: "Book not found" });

    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: "Title and author are required" });
    }

    book.title = title;
    book.author = author;
    res.json(book);
});

app.delete("/api/books/:id", (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) return res.status(404).json({ message: "Book not found" });

    books.splice(bookIndex, 1);
    res.json({ message: "Book deleted" });
});

// Serve the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));