import { useState, useEffect } from "react";
import { FiPlus, FiTrash, FiMic } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import VoiceRecordModal from "../voicerecord/VoiceRecordModal";
import TaskForm from "../../components/taskFom/taskForm";
import { taskAPI } from "../../api/api";
import "./kanban.css";

export const CustomKanban = ({ refreshTrigger }) => {
  return (
    <div className="kanban-container">
      <Board refreshTrigger={refreshTrigger} />
    </div>
  );
};

const Board = ({ refreshTrigger }) => {
  const [cards, setCards] = useState([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const isTaskOverdue = (dueDate) => {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    return due < now;
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const result = await taskAPI.getAllTasks();
      const formattedCards = result.data.map((task) => {
        let column = mapStatusToColumn(task.status);

        if (task.status !== "Done" && isTaskOverdue(task.due_date)) {
          column = "backlog";
        }

        return {
          id: task.id.toString(),
          title: task.title,
          column: column,
          priority: task.priority,
          dueDate: task.due_date,
          status: task.status,
          description: task.description,
          isOverdue: isTaskOverdue(task.due_date) && task.status !== "Done",
        };
      });
      setCards(formattedCards);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const mapStatusToColumn = (status) => {
    const statusMap = {
      "To Do": "todo",
      "In Progress": "inprogress",
      Done: "completed",
    };
    return statusMap[status] || "todo";
  };

  const mapColumnToStatus = (column) => {
    const columnMap = {
      backlog: "To Do",
      todo: "To Do",
      inprogress: "In Progress",
      completed: "Done",
    };
    return columnMap[column] || "To Do";
  };

  const handleTaskCreated = () => {
    setShowVoiceModal(false);
    setShowTaskModal(false);
    fetchTasks();
  };

  const handleCardMove = async (cardId, newColumn) => {
    const previousCards = [...cards];

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId
          ? { ...card, column: newColumn, status: mapColumnToStatus(newColumn) }
          : card
      )
    );

    try {
      const newStatus = mapColumnToStatus(newColumn);
      await taskAPI.updateTask(cardId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task:", error);
      setCards(previousCards);
    }
  };

  const handleCardDelete = async (cardId) => {
    try {
      await taskAPI.deleteTask(cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleCardAdd = async (column, title) => {
    try {
      const status = mapColumnToStatus(column);
      const result = await taskAPI.createTask({
        title,
        description: "",
        status,
        priority: "Medium",
        dueDate: null,
        isVoiceCreated: false,
      });

      const newCard = {
        id: result.data.id.toString(),
        title: result.data.title,
        column,
        priority: result.data.priority,
        status: result.data.status,
        isOverdue: false,
      };

      setCards((prev) => [...prev, newCard]);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  if (loading) {
    return (
      <div className="kanban-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="board-header">
        <button
          className="manual-create-button"
          onClick={() => setShowTaskModal(true)}
        >
          <FiPlus />
          <span>New Task</span>
        </button>
        <button
          className="voice-create-button"
          onClick={() => setShowVoiceModal(true)}
        >
          <FiMic />
          <span>Create with Voice</span>
        </button>
      </div>

      <div className="board">
        <Column
          title="Backlog"
          column="backlog"
          headingColor="backlog"
          cards={cards}
          setCards={setCards}
          onCardMove={handleCardMove}
          onCardAdd={handleCardAdd}
        />
        <Column
          title="To Do"
          column="todo"
          headingColor="todo"
          cards={cards}
          setCards={setCards}
          onCardMove={handleCardMove}
          onCardAdd={handleCardAdd}
        />
        <Column
          title="In Progress"
          column="inprogress"
          headingColor="inprogress"
          cards={cards}
          setCards={setCards}
          onCardMove={handleCardMove}
          onCardAdd={handleCardAdd}
        />
        <Column
          title="Completed"
          column="completed"
          headingColor="completed"
          cards={cards}
          setCards={setCards}
          onCardMove={handleCardMove}
          onCardAdd={handleCardAdd}
        />
        <BurnBarrel setCards={setCards} onCardDelete={handleCardDelete} />
      </div>

      {showVoiceModal && (
        <VoiceRecordModal
          onClose={() => setShowVoiceModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {showTaskModal && (
        <TaskForm
          onClose={() => setShowTaskModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </>
  );
};

const Column = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
  onCardMove,
  onCardAdd,
}) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;

      const oldColumn = cardToTransfer.column;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);

      if (oldColumn !== column) {
        onCardMove(cardId, column);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const clearHighlights = (els) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="column">
      <div className="column-header">
        <h3 className={`column-title ${headingColor}`}>{title}</h3>
        <span className="column-count">{filteredCards.length}</span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`column-content ${active ? "active" : "inactive"}`}
      >
        {filteredCards.map((c) => {
          return <Card key={c.id} {...c} handleDragStart={handleDragStart} />;
        })}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} onCardAdd={onCardAdd} />
      </div>
    </div>
  );
};

const Card = ({
  title,
  id,
  column,
  priority,
  isOverdue,
  dueDate,
  handleDragStart,
}) => {
  const getDueDateInfo = (date) => {
    if (!date) return null;
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const dueDateOnly = new Date(dueDate);
    dueDateOnly.setHours(0, 0, 0, 0);

    const diffTime = dueDateOnly.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Overdue", urgency: "overdue" };
    } else if (diffDays === 0) {
      return { text: "Due today", urgency: "today" };
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", urgency: "tomorrow" };
    } else if (diffDays <= 3) {
      return {
        text: dueDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        urgency: "soon",
      };
    } else {
      return {
        text: dueDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        urgency: "later",
      };
    }
  };

  const dueDateInfo = getDueDateInfo(dueDate);

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className={`card ${isOverdue ? "overdue" : ""}`}
      >
        <p className="card-text">{title}</p>
        <div className="card-footer">
          {priority && (
            <span className={`card-priority ${priority.toLowerCase()}`}>
              {priority}
            </span>
          )}
          {dueDateInfo && (
            <span className={`card-due-date ${dueDateInfo.urgency}`}>
              {dueDateInfo.text}
            </span>
          )}
        </div>
      </motion.div>
    </>
  );
};

const DropIndicator = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="drop-indicator"
    />
  );
};

const BurnBarrel = ({ setCards, onCardDelete }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    setCards((pv) => pv.filter((c) => c.id !== cardId));
    onCardDelete(cardId);
    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`burn-barrel ${active ? "active" : "inactive"}`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

const AddCard = ({ column, onCardAdd }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim().length) return;

    onCardAdd(column, text.trim());
    setText("");
    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit} className="add-card-form">
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            value={text}
          />
          <div className="add-card-buttons">
            <button
              onClick={() => setAdding(false)}
              className="close-button"
              type="button"
            >
              Close
            </button>
            <button type="submit" className="add-button">
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="add-card-trigger"
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};
