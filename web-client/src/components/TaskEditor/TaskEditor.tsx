import produce from 'immer';
import React from 'react';
import { Task, TaskEditorAction, TaskEditorActionType, TaskEditorActionTypeWithHistory, TaskEditorTab, TaskState, TaskStateStack, UnreachableError } from './types';


type TaskEditorProps = {
  task: Task;
};

export class TaskEditor extends React.PureComponent<TaskEditorProps, TaskStateStack> {
  constructor(props: TaskEditorProps) {
    super(props);
    this.updateState = this.updateState.bind(this);
  }

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate(prevProps: TaskEditorProps) {
    if (this.props.task !== prevProps.task) {
      this.initialize();
    }
  }

  initialize() {
    const { task } = this.props;
    const stack = createInitialTaskStack(task);
    this.setState(stack);
  }

  updateState(action: TaskEditorActionTypeWithHistory): TaskStateStack {
    const nextState = applyTaskEditorActionWithHistory(this.state, action);
    this.setState(nextState);
    return nextState;
  }

  render(): React.ReactNode {
    if (this.state == null) {
      return null;
    }
    const active = this.state.stack[this.state.index];
    return (
      <div>
        Henlo Frens! {active.isInPublicArchive ? 'Yes' : 'No'}
      </div>
    );
  }
}

function createInitialTaskStack(task: Task): TaskStateStack {
  return {
    stack: [
      {
        tab: TaskEditorTab.Details,
        slug: task.slug,
        isInPublicArchive: task.isPublicInArchive,
      },
    ],
    index: 0,
  };
}

function applyTaskEditorActionWithHistory(
  history: TaskStateStack,
  action: TaskEditorActionTypeWithHistory,
): TaskStateStack {
  if (action.kind === TaskEditorAction.Undo) {
    if (history.index == 0) {
      return history;
    } else {
      return {
        ...history,
        index: history.index - 1,
      };
    }
  } else if (action.kind === TaskEditorAction.Redo) {
    if (history.index + 1 == history.stack.length) {
      return history;
    } else {
      return {
        ...history,
        index: history.index + 1,
      };
    }
  } else {
    const currentState = history.stack[history.index];
    const nextState = produce(currentState, (draft) => applyTaskEditorAction(draft, action));
    const subarray = history.stack.slice(0, history.index + 1);
    return {
      stack: [...subarray, nextState],
      index: subarray.length,
    };
  }
}

function applyTaskEditorAction(state: TaskState, action: TaskEditorActionType): TaskState {
  if (action.kind === TaskEditorAction.ChangeTab) {
    state.tab = action.tab;
    return state;
  } else if (action.kind === TaskEditorAction.ChangeDetail) {
    state.slug = action.value;
    return state;
  } else {
    throw new UnreachableError(action);
  }
}
