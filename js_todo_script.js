document.addEventListener("DOMContentLoaded", function () {
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const filterDropdown = document.querySelector(".dropdown");
  const filterOptions = document.getElementById("filterOptions");
  const totalTasksSpan = document.getElementById("totalTasks");
  const activeTasksSpan = document.getElementById("activeTasks");
  const completedTasksSpan = document.getElementById("completedTasks");
  const taskProgress = document.getElementById("taskProgress");
  const deleteSelectedButton = document.getElementById("deleteSelected");
  const deleteAllButton = document.getElementById("deleteAll");
  const message = document.getElementById("message");

  loadTasks();

  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addTask();
    updateTaskCounts();
  });

  taskList.addEventListener("click", function (e) {
    let clickedElement = e.target;

    //Au clic sur le text de la tâche
    if (clickedElement.tagName === "SPAN") {
      toggleTask(clickedElement.parentElement);
      updateTaskCounts();
    }
    //Suppression d'une tâche
    if (clickedElement.classList.contains("delete")) {
      deleteTask(clickedElement.parentElement);
      updateTaskCounts();
    }
    if (clickedElement.classList.contains("bx-trash")) {
      deleteTask(clickedElement.parentElement.parentElement);
      updateTaskCounts();
    }
    // Validation d'une tâche

    //Au clic sur le bouton check => tâche completée
    if (clickedElement.classList.contains("complete")) {
      completeTask(clickedElement.parentElement);
      updateTaskCounts();
    }
    //Au clic sur le bouton check => tâche completée
    if (clickedElement.classList.contains("bx-check")) {
      completeTask(clickedElement.parentElement.parentElement);
      updateTaskCounts();
    }

    saveTasks();
    updateProgress();
    // checkEmpty();
  });

  //Suppression de la tâche selectionnée
  deleteSelectedButton.addEventListener("click", function () {
    const completedTasks = taskList.querySelectorAll("li.completed");
    const lastCompletedTask = completedTasks[completedTasks.length - 1];
    if (lastCompletedTask) {
      if (
      confirm(
        "Voulez-vous vraiment supprimer cette tâches ?\n Cette opération est irréversible"
      ) == true
    ) {
      deleteLastCompletedTask();
      updateTaskCounts();
      saveTasks();
      updateProgress();
      // checkEmpty();
    }
    } else {
      alert(
        "INFO: Aucune tâche selectionnée, la liste est vide ou aucune tâche n'est completée"
      );
    }
    
  });

  //Suppresion de toutes les tâches
  deleteAllButton.addEventListener("click", function () {
    if (totalTasksSpan.textContent * 1 !== 0) {
      if (
        confirm(
          "⚠ Voulez-vous vraiment supprimer toutes les tâches ?\n Cette opération est irréversible."
        ) == true
      ) {
        deleteAllTasks();
        updateTaskCounts();
        saveTasks();
        updateProgress();
        // checkEmpty();
      }
    } else {
      alert("INFO: Aucune tâche à supprimer");
    }
  });

  filterOptions.addEventListener("click", function (e) {
    let clickedElement = e.target;
    if (clickedElement.tagName === "A") {
      filterTasks(clickedElement.getAttribute("data-filter"));
    }
  });

  //permet d'ajouter une tâche
  function addTask() {
    let newTaskInput = document.getElementById("newTask");
    let taskText = newTaskInput.value.trim();
    //J'ai mis toutes ces conditions parceque j'avais des erreurs dans firefox
    //La première conditions est suffisante
    if (taskText !== "" && taskText !== null && taskText !== undefined) {
      let newTaskItem = document.createElement("li");
      newTaskItem.innerHTML = `
                <span>${taskText}</span>
                <button class="complete"><i class='bx bx-check bx-sm'></i></button>
                <button class="delete"><i class='bx bx-trash bx-sm'></i></button>
            `;
      taskList.appendChild(newTaskItem);
      newTaskInput.value = "";
      newTaskInput.focus();

      // checkEmpty();
      saveTasks();
      updateProgress();
    } else {
      alert("INFO: Une tâhe ne peut être vide !");
    }
  }

  function toggleTask(task) {
    // console.log(task.children[0].classList);
    task.children[0].classList.toggle("line-task");
    task.classList.toggle("completed");
  }

  function deleteTask(task) {
    task.parentNode.removeChild(task);
  }

  function completeTask(task) {
    toggleTask(task);
  }

  // Ajouter la nouvelle fonction pour supprimer la dernière tâche complétée

  function deleteLastCompletedTask() {
    let completedTasks = taskList.querySelectorAll("li.completed");

    // Vérifier s'il y a des tâches complétées
    if (completedTasks.length > 0) {
      let lastCompletedTask = completedTasks[completedTasks.length - 1];
      deleteTask(lastCompletedTask);
    }
  }
  //Supprime une
  function deleteAllTasks() {
    while (taskList.firstChild) {
      taskList.removeChild(taskList.firstChild);
    }
  }

  //Enregistre les tâches dans le navigateur
  function saveTasks() {
    let tasks = Array.from(taskList.children).map(function (task) {
      return {
        text: task.querySelector("span").textContent,
        completed: task.classList.contains("completed"),
      };
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  //Charge les tâches dans le stokage local du vavigateur
  function loadTasks() {
    let storedTasks = localStorage.getItem("tasks");

    if (storedTasks) {
      let tasks = JSON.parse(storedTasks);

      tasks.forEach(function (task) {
        let newTaskItem = document.createElement("li");
        newTaskItem.innerHTML = `
                    <span>${task.text}</span>
                    <button class="complete"> <i class="bx bx-check bx-sm"></i> </button>
                    <button class="delete"><i class="bx bx-trash bx-sm"></i></button>
                `;

        if (task.completed) {
          newTaskItem.classList.add("completed");
          //permet de barrer uniquement le texte de la tâche une fois récupérer du stockage
          newTaskItem.children[0].classList.add("line-task");
        }

        taskList.appendChild(newTaskItem);
      });
    }

    updateTaskCounts();
    updateProgress();
  }

  //permet de faire le filtre des tâches en fonction de choix dans le filtre
  function filterTasks(filter) {
    // let tasks = Array.from(taskList.children)

    let tasks = [...taskList.children]; // Voici une autre façon de copier le tableau pour ne pas modifier le tableau original

    tasks.forEach(function (task) {
      let isCompleted = task.classList.contains("completed");

      switch (filter) {
        case "all":
          task.style.display = "flex";
          break;
        case "active":
          task.style.display = isCompleted ? "none" : "flex";
          break;
        case "completed":
          task.style.display = isCompleted ? "flex" : "none";
          break;
        default:
          break;
      }
    });

    updateTaskCounts();
    updateProgress();
  }

  function updateTaskCounts() {
    let totalTasks = taskList.children.length;
    let activeTasks = taskList.querySelectorAll("li:not(.completed)").length;
    let completedTasks = totalTasks - activeTasks;

    totalTasksSpan.textContent = totalTasks;
    activeTasksSpan.textContent = activeTasks;
    completedTasksSpan.textContent = completedTasks;
  }

  function updateProgress() {
    let totalTasks = taskList.children.length;
    let completedTasks = taskList.querySelectorAll("li.completed").length;
    let progressValue =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    taskProgress.value = progressValue;
    document.querySelector("#progressTooltip").innerText =
      Math.round(progressValue) + " %";
  }

  // function checkEmpty() {
  //   console.log("Total taches " + totalTasksSpan.innerText);
  //   message.style.display =
  //     parseInt(totalTasksSpan.innerText) === 0 ? "block" : "none";
  //   // message.style.display = taskList.children.length === 0 ? 'block' : 'none';
  // }
});
