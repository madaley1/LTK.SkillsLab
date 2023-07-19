import { createSlice } from '@reduxjs/toolkit';

const getLocalStorage = () => {
  const storage = localStorage.getItem('todoList');
  if(!storage || !storage.length){
    return []
  }else{
    return storage
  }
}

export const todoSlice = createSlice({
  name: 'todo',
  initialState: {
    items: JSON.parse(getLocalStorage())
  },
  reducers:{
    addTodo:(state, todoItem) => {
      console.log(todoItem.payload)
      state.items.push(todoItem.payload["Add ToDo"]);
    },
    removeTodo: (state, todoIndex) => {
      console.log(todoIndex.payload)
      state.items.splice(todoIndex.payload.index, 1);
    },
    editTodo: (state, action) => {
      const [todoIndex, todoResult] = action.payload
      console.log(action.payload)
      console.log(todoIndex, todoResult)
      state.items[todoIndex] = todoResult;
    }
  }
})

export const {addTodo, removeTodo, editTodo} = todoSlice.actions

export default todoSlice.reducer;