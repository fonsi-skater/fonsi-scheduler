import { fireEvent, render } from "@testing-library/react-native";

import { TaskForm } from "../TaskForm";

describe("TaskForm", () => {
  it("shows validation for a missing task title", async () => {
    const { getByText, findByText } = render(
      <TaskForm
        defaultReminderMinutes={null}
        onSubmit={jest.fn()}
        submitting={false}
        submitLabel="Add task"
      />
    );

    fireEvent.press(getByText("Add task"));

    expect(await findByText("Give your task a name.")).toBeTruthy();
  }, 15000);
});
