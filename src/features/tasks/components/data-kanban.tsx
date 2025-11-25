import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useCallback, useState, useEffect } from "react";
import { TaskStatus } from "../types";
import { KanbanColumnHeader } from "./kanban-column-header";

const boards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

type TaskState = {
  [key in TaskStatus]: any[];
};

interface DataKanbanProps {
  data: any[];
}

export const DataKanban = ({ data }: DataKanbanProps) => {
  const [tasks, setTasks] = useState<TaskState>(() => {
    const initialTasks: any = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      initialTasks[task.status].push(task);
    });

    Object.keys(initialTasks).forEach((key) => {
      initialTasks[key as TaskStatus].sort(
        (a: any, b: any) => a.position - b.position
      );
    });

    return initialTasks;
  });

  return (
    <DragDropContext onDragEnd={() => {}}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div
              key={board}
              className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]"
            >
              <KanbanColumnHeader
                board={board}
                taskCount={tasks[board].length}
              />
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
