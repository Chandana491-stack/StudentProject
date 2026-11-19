
const API_URL = "http://localhost:8080/Students";

const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const search = document.getElementById("search");
const emptyMessage = document.getElementById("emptyMessage");

let students = [];

// Get all students from Spring Boot
async function getStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to get students");
        }

        students = await response.json();
        displayStudents();

    } catch (error) {
        console.error(error);
        alert("Backend connection failed. Please check Spring Boot.");
    }
}

// Display students in frontend table
function displayStudents(list = students) {

    table.innerHTML = "";

    emptyMessage.style.display =
        list.length === 0 ? "block" : "none";

    list.forEach(student => {

        const row = document.createElement("tr");

        const values = [
            student.id,
            student.name,
            student.email,
            student.course,
            student.age
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit";
        editButton.onclick = () => editStudent(student.id);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";
        deleteButton.onclick = () => deleteStudent(student.id);

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);

        table.appendChild(row);
    });
}

// Add or update student
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const editId = document.getElementById("editIndex").value;

    const student = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value.trim(),
        age: Number(document.getElementById("age").value)
    };

    if (!student.name || !student.email ||
        !student.course || student.age <= 0) {

        alert("Please enter valid student details.");
        return;
    }

    try {

        let response;

        if (editId) {

            response = await fetch(`${API_URL}/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });

        } else {

            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });
        }

        if (!response.ok) {
            throw new Error("Student operation failed");
        }

        alert(editId ?
            "Student updated successfully!" :
            "Student added successfully!");

        form.reset();

        document.getElementById("editIndex").value = "";
        document.getElementById("submitBtn").textContent = "Add Student";

        await getStudents();

    } catch (error) {
        console.error(error);
        alert("Unable to save student. Please check the backend.");
    }
});

// Edit student
function editStudent(id) {

    const student = students.find(s => s.id === id);

    if (!student) return;

    document.getElementById("editIndex").value = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("course").value = student.course;
    document.getElementById("age").value = student.age;

    document.getElementById("submitBtn").textContent = "Update Student";
}

// Delete student
async function deleteStudent(id) {

    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete student");
        }

        alert("Student deleted successfully!");

        await getStudents();

    } catch (error) {
        console.error(error);
        alert("Unable to delete student.");
    }
}

// Search students
search.addEventListener("input", function() {

    const value = search.value.toLowerCase();

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(value) ||
        student.email.toLowerCase().includes(value) ||
        student.course.toLowerCase().includes(value)
    );

    displayStudents(filtered);
});

// Load students when page opens
getStudents();
