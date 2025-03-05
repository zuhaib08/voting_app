function logout() {
    localStorage.clear(); // Clears all stored data
    if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'admin.html'; // Redirect to admin login
    } else {
        window.location.href = 'login.html'; // Redirect to user login
    }
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        // console.log("login", data)
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.ID);
            window.location.href = 'candidates.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Login failed. Please try again.');
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const aadhar = document.getElementById('aadhar').value;
    const password = document.getElementById('password').value;
    

    try {
        const response = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, age, mobile, email, address, aadharCardNumber: aadhar, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please log in.');
            window.location.href = 'login.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Registration failed. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('candidates.html')) {
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3001/api/vote/candidates', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }

            const data = await response.json();
            const candidatesList = document.getElementById('candidatesList');
            if (data.candidates && data.candidates.length > 0) {
                data.candidates.forEach(candidate => {
                    const candidateDiv = document.createElement('div');
                    candidateDiv.classList.add('candidateCard');
                    candidateDiv.innerHTML = `
                        <h3>${candidate.name}</h3>
                        <p>${candidate.party}</p>
                        <button onclick="vote(${candidate.id}, '${candidate.name}')">Vote</button>
                    `;
                    candidatesList.appendChild(candidateDiv);
                });
            } else {
                candidatesList.innerHTML = '<p>No candidates available.</p>';
            }
        } catch (error) {
            alert('Error loading candidates');
        }
    }

    if (window.location.pathname.includes('voteConfirmation.html')) {
        const votedCandidate = document.getElementById('votedCandidate');
        const votedMessage = document.getElementById('votedMessage');
        const notVotedMessage = document.getElementById('notVotedMessage');
    
        (async function checkVoted() {
            try {
                const response = await fetch('http://localhost:3001/api/vote/votes');
                const data = await response.json();
    
                const userID = localStorage.getItem("userId"); 
                const candidateNames = data.candidateNames; 
                const voterIds = data.voterIds; 
    
                if (voterIds.includes(Number(userID))) {
                    const index = voterIds.indexOf(Number(userID));
    
                    const votedCandidateName = candidateNames[index];
    
                    votedCandidate.innerText = `${votedCandidateName}`;
    
          
                    votedMessage.style.display = 'block';
                    notVotedMessage.style.display = 'none';
                } else {
                    notVotedMessage.style.display = 'block';
                    votedMessage.style.display = 'none';
                    votedCandidate.style.display = 'none';
                }
            } catch (error) {
                alert('Error loading candidates');
            }
        })();
    }
    
    
});

// (async function getVoters() {
//     try {
//         const response = await fetch('http://localhost:3001/api/vote/votes');
//         const data = await response.json();
//         const voties = data.voterIds

//         const userID = localStorage.getItem("userId"); 
       
        
//         if (voties.includes(Number(userID))) {
//             console.log("voted");
//         } else {
//             console.log("not voted");
//         }
//     } catch (error) {
//         alert('Error loading candidates');
//     }
// })();

async function vote(candidateId, candidateName) {
    const token = localStorage.getItem('token');
    const voteButton = document.querySelector(`button[onclick="vote(${candidateId}, '${candidateName}')"]`);
    voteButton.disabled = true;
    voteButton.textContent = 'Voting...';
// console.log(candidateName)
    try {
        const response = await fetch(`http://localhost:3001/api/vote/${candidateId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        // console.log({data})

        if (response.ok) {
            window.location.href = 'voteConfirmation.html';
            localStorage.removeItem('voteCandidate' ,candidateName);
            alert('Vote recorded successfully');
        }  else {
            alert("You have already voted");
        }
    } catch (error) {
        alert('Error casting vote');
    } finally {
        voteButton.disabled = false;
        voteButton.textContent = 'Vote';
    }
}



// Admin Login
document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3001/api/auth/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Admin login failed. Please try again.');
    }
});

// Fetch Admin Dashboard Data
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('dashboard.html')) {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            window.location.href = 'admin.html';
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/vote/admin/votes', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                window.location.href = 'admin.html';
                return;
            }

            const data = await response.json();
            document.getElementById('totalVotes').innerText = `Total Votes: ${data.totalVotes}`;

            const tbody = document.querySelector('#candidateVotes tbody');
            tbody.innerHTML = data.candidateVotes.map(candidate => `
                <tr>
                    <td>${candidate.name}</td>
                    <td>${candidate.party}</td>
                    <td>${candidate.voteCount}</td>
                </tr>
            `).join('');
        } catch (error) {
            alert('Error loading dashboard data');
        }
    }
});