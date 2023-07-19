import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field, Form } from 'formik';
import { Button } from '@mui/material';

import { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { addTodo, removeTodo, editTodo } from '../redux/todoSlice/todoSlice';

const BasicForm = () => {
  const state = useSelector((state) => state.todo.items);
  const dispatch = useDispatch();

  useEffect(()=>{
    localStorage.setItem('todoList', JSON.stringify(state))
  }, [state])

  const editEntry = (index, item) => {
    const edited = prompt('please enter the desired todo', item);
    console.log(edited);
    dispatch(editTodo([index, edited]));
  }
  return(
    <div>
      <h1>TODO</h1>
      <Formik
        initialValues={{
          "Add ToDo": '',
        }}
        onSubmit={(values, {resetForm}) => {dispatch(addTodo(values)); console.log(state); resetForm();}}
      >
        <Form>
          <label htmlFor="todo">Add ToDo </label>
          <Field id="todo" name="Add ToDo" placeholder="TextHere" />
          <button type="submit">Submit</button>
        </Form>
      </Formik>
      <div id="todoItems">
          {state.map((item, index)=>{
            return(
              <div class="entry">
                <p key={index}>{item}</p>
                <button onClick={() => editEntry(index, item)}>edit</button>
                <button onClick={()=> dispatch(removeTodo(index))}>&times;</button>
              </div>
            )
          })}
        </div>
    </div>
  );
};

export default BasicForm
