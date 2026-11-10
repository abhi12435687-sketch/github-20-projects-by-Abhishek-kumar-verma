
// Educational resource collection
const resources = [

    {
        id: 1,
        title: "Introduction to C Programming",
        author: "Dennis Ritchie",
        subject: "Programming",
        type: "Book",
        icon: "💻",
        description: "Learn the fundamentals of C programming.",
        link: "https://en.cppreference.com/w/c"
    },

    {
        id: 2,
        title: "JavaScript Basics",
        author: "MDN Web Docs",
        subject: "Programming",
        type: "Study Material",
        icon: "🌐",
        description: "Learn JavaScript concepts and programming.",
        link: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting"
    },

    {
        id: 3,
        title: "Engineering Mathematics",
        author: "OpenStax",
        subject: "Mathematics",
        type: "Book",
        icon: "📐",
        description: "Explore mathematical concepts and applications.",
        link: "https://openstax.org/subjects/math"
    },

    {
        id: 4,
        title: "Fundamentals of Physics",
        author: "OpenStax",
        subject: "Science",
        type: "Book",
        icon: "🔬",
        description: "Understand basic physics principles.",
        link: "https://openstax.org/subjects/science"
    },

    {
        id: 5,
        title: "Introduction to Artificial Intelligence",
        author: "IBM",
        subject: "AI & ML",
        type: "Study Material",
        icon: "🤖",
        description: "Explore artificial intelligence fundamentals.",
        link: "https://www.ibm.com/think/topics/artificial-intelligence"
    },

    {
        id: 6,
        title: "Machine Learning Basics",
        author: "Google",
        subject: "AI & ML",
        type: "Study Material",
        icon: "🧠",
        description: "Learn the fundamentals of machine learning.",
        link: "https://developers.google.com/machine-learning/crash-course"
    },

    {
        id: 7,
        title: "Python Programming",
        author: "Python Documentation",
        subject: "Programming",
        type: "Study Material",
        icon: "🐍",
        description: "Learn Python programming from official documentation.",
        link: "https://docs.python.org/3/tutorial/"
    },

    {
        id: 8,
        title: "Algebra and Geometry",
        author: "Khan Academy",
        subject: "Mathematics",
        type: "Study Material",
        icon: "📊",
        description: "Study algebra, geometry and mathematical concepts.",
        link: "https://www.khanacademy.org/math"
    }

];

// Display resources
function displayResources() {

    let container = document.getElementById("resource-container");

    let searchValue = document
        .getElementById("search")
        .value.toLowerCase();

    let subjectValue = document
        .getElementById("subject")
        .value;

    // Search and filter resources
    let filteredResources = resources.filter(resource => {

        let matchesSearch = resource.title
            .toLowerCase()
            .includes(searchValue);

        let matchesSubject =
            subjectValue === "All" ||
            resource.subject === subjectValue;

        return matchesSearch && matchesSubject;

    });

    container.innerHTML = "";

    // If no resources are found
    if (filteredResources.length === 0) {

        container.innerHTML =
            "<p>No resources found.</p>";

        return;
    }

    // Display filtered resources
    filteredResources.forEach(resource => {

        container.innerHTML += `

            <div class="resource-card">

                <div class="resource-icon">
                    ${resource.icon}
                </div>

                <h3>${resource.title}</h3>

                <p>Author: ${resource.author}</p>

                <p>Type: ${resource.type}</p>

                <span class="subject-tag">
                    ${resource.subject}
                </span>

                <p>${resource.description}</p>

                <a href="${resource.link}"
                   target="_blank"
                   rel="noopener noreferrer">
                    View Resource
                </a>

            </div>

        `;

    });

}

// Initial display
displayResources();
