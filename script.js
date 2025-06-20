document.addEventListener("DOMContentLoaded",function(){


    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    //returnn true or false
    function validateUsername(username){
        if(username.trim()===""){
            alert("Username should not be empty");
            return false;
        }
        const regex= /^[a-zA-Z0-9_]+$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Invalid username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
    try {
        searchButton.textContent = "Searching...";
        searchButton.disabled = true;

        const graphqlQuery = {
            query: `
                query userSessionProgress($username: String!) {
                    allQuestionsCount {
                        difficulty
                        count
                    }
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                            totalSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                    }
                }
            `,
            variables: { username }
        };

        const targetUrl = "https://leetcode.com/graphql";
        const proxyUrl = "https://thingproxy.freeboard.io/fetch/";

        const response = await fetch(proxyUrl + targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(graphqlQuery)
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const parsedData = await response.json();
        if (!parsedData.data.matchedUser) throw new Error("User not found");

        displayUserData(parsedData);
        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }


    function updateProgress(solved,total,label,circle){
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree",`${progressDegree}%`);
        label.innerHTML = `<p>${label.dataset.difficulty}</p> <span>${solved}/${total}</span>`;
    }
    function displayUserData(parsedData){

        console.log("Displaing user data",parsedData);

        if (!parsedData.data || !parsedData.data.matchedUser) {
            console.error("Invalid user data structure.");
            statsContainer.innerHTML = "<p>Invalid data format from API</p>";
            return;
        }
        
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;
        
        updateProgress(solvedTotalEasyQues,totalEasyQues,easyLabel,easyProgressCircle);
        updateProgress(solvedTotalMediumQues,totalMediumQues,mediumLabel,mediumProgressCircle);
        updateProgress(solvedTotalHardQues,totalHardQues,hardLabel,hardProgressCircle);

        const cardsData = [
            {label: "Overall Submissions",value:parsedData.
                data.matchedUser.submitStats.totalSubmissionNum[0].
                submissions},
            {label: "Overall Easy Submissions",value:parsedData.
                data.matchedUser.submitStats.totalSubmissionNum[1].
                submissions},
            {label: "Overall Medium Submissions",value:parsedData.
                data.matchedUser.submitStats.totalSubmissionNum[2].
                submissions},
            {label: "Overall Hard Submissions",value:parsedData.
                data.matchedUser.submitStats.totalSubmissionNum[3].
                submissions},
        ];

        console.log(cardStatsContainer);

        cardStatsContainer.innerHTML = cardsData.map(
            data =>
                    `<div class="card">
                    <h4>${data.label}</h3>
                    <p>${data.value}</p>
                    </div>`
        ).join("")
    }
    searchButton.addEventListener("click",function(){
        const username=usernameInput.value;
        console.log(username);
        if(validateUsername(username)){
            fetchUserDetails(username);
        }
    })
    usernameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            searchButton.click();
        }
    })
})