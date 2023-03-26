import React, { useContext } from 'react';
import { TaskEditorActionTypeWithHistory, TaskState, TaskStateStack } from './types';

type TaskEditorActionFunction = (action: TaskEditorActionTypeWithHistory) => TaskStateStack;

export const TaskEditorHistory = React.createContext<TaskStateStack>(null as unknown as TaskStateStack);

export const TaskEditorAction = React.createContext<TaskEditorActionFunction>(null as unknown as TaskEditorActionFunction);

export function useTaskEditorState(): TaskState {
  const history = useContext(TaskEditorHistory);
  return history.stack[history.index];
}

export function useTaskEditorHistory(): TaskStateStack {
  const history = useContext(TaskEditorHistory);
  return history;
}

export function useTaskEditorAction(): TaskEditorActionFunction {
  const action = useContext(TaskEditorAction);
  return action;
}
