import React, { useReducer, useEffect, useRef } from "react";
import PageDragLayer from "../components/PageDragLayer";
import Page from "../components/Page";
import {
  Trash,
  ArrowClockwise,
  ArrowCounterclockwise,
  Plus,
} from "react-bootstrap-icons";
import {
  updatePagesOrder,
  generatePages,
  addMultipleEventListener,
  removeMultipleEventListener,
  rotateLeft,
  rotateRight,
} from "../Utils/utils.js";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isDesktop, isMobile } from "react-device-detect";

const init_state = {
  pages: new Array(),
  selectedPages: [],
  lastSelectedIndex: -1,
  dragIndex: -1,
  hoverIndex: -1,
  insertIndex: -1,
  isDragging: false,
};

const pageReducer = (state, action) => {
  switch (action.type) {
    case "ADD_PAGES":
      const newPages = state.pages.concat([action.newPage]);
      newPages = updatePagesOrder(newPages);
      return {
        ...state,
        pages: newPages,
        selectedPages: init_state.selectedPages,
      };

    case "DELETE_PAGES":
      return {
        ...state,
        pages: action.newPages,
        selectedPages: init_state.selectedPages,
        lastSelectedIndex: init_state.lastSelectedIndex,
      };

    case "DELETE_PAGE":
      return {
        ...state,
        pages: action.newPages,
        selectedPages: action.newSelectedPages,
        lastSelectedIndex: action.newLastSelectedIndex,
      };

    case "ROTATE_SELECTION_LEFT":
      return {
        ...state,
        pages: action.newPages,
        selectedPages: action.newSelectedPages,
      };

    case "ROTATE_PAGE_LEFT":
      const newRotatedLeftPage = action.newPage;
      const newPagesAfterPageRotationLeft = state.pages.map((page) => {
        if (page.id === newRotatedLeftPage.id) {
          return newRotatedLeftPage;
        } else {
          return page;
        }
      });

      const newSelectedPagesAfterPageRotationLeft = state.selectedPages.map(
        (selPage) => {
          if (selPage.id === newRotatedLeftPage.id) {
            return newRotatedLeftPage;
          } else {
            return selPage;
          }
        }
      );

      return {
        ...state,
        pages: newPagesAfterPageRotationLeft,
        selectedPages: newSelectedPagesAfterPageRotationLeft,
      };

    case "ROTATE_PAGE_RIGHT":
      const newRotatedRightPage = action.newPage;
      const newPagesAfterPageRotationRight = state.pages.map((page) => {
        if (page.id === newRotatedRightPage.id) {
          return newRotatedRightPage;
        } else {
          return page;
        }
      });

      const newSelectedPagesAfterPageRotationRight = state.selectedPages.map(
        (selPage) => {
          if (selPage.id === newRotatedRightPage.id) {
            return newRotatedRightPage;
          } else {
            return selPage;
          }
        }
      );

      return {
        ...state,
        pages: newPagesAfterPageRotationRight,
        selectedPages: newSelectedPagesAfterPageRotationRight,
      };

    case "ROTATE_SELECTION_RIGHT":
      return {
        ...state,
        pages: action.newPages,
        selectedPages: action.newSelectedPages,
      };

    case "CLEAR_SELECTION":
      return {
        ...state,
        selectedPages: init_state.selectedPages,
        lastSelectedIndex: init_state.lastSelectedIndex,
      };

    case "UPDATE_SELECTION":
      return {
        ...state,
        selectedPages: action.newSelectedPages,
        lastSelectedIndex: action.newLastSelectedIndex,
      };

    case "SELECT_PAGE":
      const newSelectedPage = action.newSelectedPage;
      let newSelectedPagesAdd;
      const addedIndex = state.selectedPages.findIndex(
        (f) => f === newSelectedPage
      );
      if (addedIndex >= 0) {
        newSelectedPagesAdd = [...state.selectedPages];
      } else {
        newSelectedPagesAdd = [...state.selectedPages, newSelectedPage];
      }
      return {
        ...state,
        selectedPages: newSelectedPagesAdd,
        lastSelectedIndex: action.newLastSelectedIndex,
      };

    case "REMOVE_SELECT_PAGE":
      const newUnselectedPage = action.newUnselectedPage;
      let newSelectedPagesRemove;
      const removedIndex = state.selectedPages.findIndex(
        (f) => f === newUnselectedPage
      );
      if (removedIndex >= 0) {
        newSelectedPagesRemove = [
          ...state.selectedPages.slice(0, removedIndex),
          ...state.selectedPages.slice(removedIndex + 1),
        ];
      } else {
        newSelectedPagesRemove = [...state.selectedPages];
      }

      return {
        ...state,
        selectedPages: newSelectedPagesRemove,
        lastSelectedIndex: action.newLastSelectedIndex,
      };

    case "REARRANGE_PAGES":
      return {
        ...state,
        pages: action.newPages,
        selectedPages: action.newSelectedPages,
        lastSelectedIndex: action.newLastSelectedIndex,
      };

    case "SET_INSERTINDEX":
      return {
        ...state,
        dragIndex: action.dragIndex,
        hoverIndex: action.hoverIndex,
        insertIndex: action.insertIndex,
      };

    case "EMPTY_PAGES_ARRAY":
      return init_state;

    default:
      return state;
  }
};

const Home = React.memo(function Home() {
  const deleteBtn = useRef();
  const rotateLeftBtn = useRef();
  const rotateRightBtn = useRef();
  const mountedRef = useRef(false);
  const [state, dispatch] = useReducer(pageReducer, init_state);
  const jsStickyTop = useRef();

  const opts = {
    scrollAngleRanges: [
      { start: 30, end: 150 },
      { start: 210, end: 330 },
    ],
  };

  const addPage = (addedPage) => {
    if (mountedRef.current) {
      dispatch({
        type: "ADD_PAGES",
        newPage: addedPage,
      });
    }
  };

  const rotateSelectedPagesToRight = () => {
    const pages = state.pages;
    const selectedPages = state.selectedPages;
    const newItemsLIst = [];
    if (selectedPages.length === 0) {
      newItemsLIst = pages.map((page) => {
        const newRotation = rotateRight(page.rotation);
        return { ...page, rotation: newRotation };
      });

      if (mountedRef.current) {
        dispatch({
          type: "ROTATE_SELECTION_RIGHT",
          newPages: newItemsLIst,
          newSelectedPages: init_state.selectedPages,
        });
      }
    } else {
      let newSelectedPages = [];
      newItemsLIst = pages.map((page) => {
        const found = selectedPages.find((element) => element.id === page.id);
        if (found) {
          const newRotation = rotateRight(page.rotation);
          const updatedPage = { ...page, rotation: newRotation };
          newSelectedPages.push(updatedPage);
          return updatedPage;
        } else {
          return page;
        }
      });

      if (mountedRef.current) {
        dispatch({
          type: "ROTATE_SELECTION_RIGHT",
          newPages: newItemsLIst,
          newSelectedPages: newSelectedPages,
        });
      }
    }
  };

  const rotateSelectedPagesToLeft = () => {
    const pages = state.pages;
    const selectedPages = state.selectedPages;
    const newItemsLIst = [];

    if (selectedPages.length === 0) {
      newItemsLIst = pages.map((page) => {
        const newRotation = rotateLeft(page.rotation);
        return { ...page, rotation: newRotation };
      });

      if (mountedRef.current) {
        dispatch({
          type: "ROTATE_SELECTION_LEFT",
          newPages: newItemsLIst,
          newSelectedPages: init_state.selectedPages,
        });
      }
    } else {
      let newSelectedPages = [];
      newItemsLIst = pages.map((page) => {
        const found = selectedPages.find((element) => element.id === page.id);
        if (found) {
          const newRotation = rotateLeft(page.rotation);
          const updatedPage = { ...page, rotation: newRotation };
          newSelectedPages.push(updatedPage);
          return updatedPage;
        } else {
          return page;
        }
      });

      if (mountedRef.current) {
        dispatch({
          type: "ROTATE_SELECTION_LEFT",
          newPages: newItemsLIst,
          newSelectedPages: newSelectedPages,
        });
      }
    }
  };

  const deleteSelectedPages = () => {
    const pages = state.pages;
    const selectedPages = state.selectedPages;
    let result = selectedPages.map(({ id }) => parseInt(id));
    let newPages = pages.filter((page) => !result.includes(page.id));
    newPages = updatePagesOrder(newPages);

    if (mountedRef.current) {
      dispatch({
        type: "DELETE_PAGES",
        newPages: newPages,
        newSelectedPages: [],
        newLastSelectedIndex: -1,
      });
    }
  };

  const clearPageSelection = () => {
    dispatch({ type: "CLEAR_SELECTION" });
  };

  const handlePagesSelection = (index, ctrlKey) => {
    let newSelectedPages;
    const pages = state.pages;
    const page = index < 0 ? "" : pages[index];
    const newLastSelectedIndex = index;
    if (!ctrlKey) {
      newSelectedPages = [page];
    } else {
      const foundIndex = state.selectedPages.findIndex((f) => f === page);
      if (foundIndex >= 0) {
        newSelectedPages = [
          ...state.selectedPages.slice(0, foundIndex),
          ...state.selectedPages.slice(foundIndex + 1),
        ];
      } else {
        newSelectedPages = [...state.selectedPages, page];
      }
    }
    const finalList = pages
      ? pages.filter((f) => newSelectedPages.find((a) => a === f))
      : [];
    dispatch({
      type: "UPDATE_SELECTION",
      newSelectedPages: finalList,
      newLastSelectedIndex: newLastSelectedIndex,
    });
  };

  const handlePagesSelectionOnMobile = (index) => {
    let newSelectedPages;
    const pages = state.pages;
    const page = index < 0 ? "" : pages[index];
    const newLastSelectedIndex = index;

    const foundIndex = state.selectedPages.findIndex((f) => f === page);
    if (foundIndex >= 0) {
      newSelectedPages = [
        ...state.selectedPages.slice(0, foundIndex),
        ...state.selectedPages.slice(foundIndex + 1),
      ];
    } else {
      newSelectedPages = [...state.selectedPages, page];
    }

    const finalList = pages
      ? pages.filter((f) => newSelectedPages.find((a) => a === f))
      : [];
    dispatch({
      type: "UPDATE_SELECTION",
      newSelectedPages: finalList,
      newLastSelectedIndex: newLastSelectedIndex,
    });
  };

  const rearrangePages = (dragItem) => {
    let pages = state.pages.slice();
    const draggedPages = dragItem.pages;
    const newLastSelectedIndex = draggedPages[0]?.index;
    let dividerIndex;
    if ((state.insertIndex >= 0) & (state.insertIndex < pages.length)) {
      dividerIndex = state.insertIndex;
    } else {
      dividerIndex = pages.length;
    }
    const upperHalfRemainingPages = pages
      .slice(0, dividerIndex)
      .filter((c) => !draggedPages.find((dc) => dc.id === c.id));
    const lowerHalfRemainingPages = pages
      .slice(dividerIndex)
      .filter((c) => !draggedPages.find((dc) => dc.id === c.id));
    const newPages = [
      ...upperHalfRemainingPages,
      ...draggedPages,
      ...lowerHalfRemainingPages,
    ];

    newPages = updatePagesOrder(newPages);

    if (mountedRef.current) {
      dispatch({
        type: "REARRANGE_PAGES",
        newPages: newPages,
        newSelectedPages: draggedPages,
        newLastSelectedIndex: newLastSelectedIndex,
      });
    }
  };

  const setInsertIndex = (dragIndex, hoverIndex, newInsertIndex) => {
    if (
      state.dragIndex === dragIndex &&
      state.hoverIndex === hoverIndex &&
      state.insertIndex === newInsertIndex
    ) {
      return;
    }
    dispatch({
      type: "SET_INSERTINDEX",
      dragIndex: dragIndex,
      hoverIndex: hoverIndex,
      insertIndex: newInsertIndex,
    });
  };

  useEffect(() => {
    mountedRef.current = true;

    const deleteBtnCurrent = deleteBtn.current;
    const rotateRightBtnCurrent = rotateRightBtn.current;
    const rotateLeftBtnCurrent = rotateLeftBtn.current;

    const handleStopPropagation = (e) => {
      e.stopPropagation();
    };

    addMultipleEventListener(
      [deleteBtnCurrent, rotateRightBtnCurrent, rotateLeftBtnCurrent],
      ["pointerup", "mouseup", "touchend"],
      handleStopPropagation
    );

    return () => {
      dispatch({
        type: "EMPTY_PAGES_ARRAY",
      });
      mountedRef.current = false;
      removeMultipleEventListener(
        [deleteBtnCurrent, rotateRightBtnCurrent, rotateLeftBtnCurrent],
        ["pointerup", "mouseup", "touchend"],
        handleStopPropagation
      );
    };
  }, []);
  return (
    <>
      <div
        className="panel nav-container sticky-top sticky-top-border"
        ref={jsStickyTop}
      >
        <div className="panel__inner d-flex align-items-center justify-content-end justify-content-md-center ">
          <button
            className="btn btn-normal mr-5"
            onClick={() => {
              generatePages(addPage);
            }}
          >
            <Plus />
          </button>

          <button
            ref={rotateLeftBtn}
            className={
              "btn btn-normal mr-5 " +
              `${state.pages.length > 0 ? "" : "disabled"}`
            }
            onClick={rotateSelectedPagesToLeft}
          >
            <ArrowCounterclockwise />
          </button>
          <button
            ref={rotateRightBtn}
            className={
              "btn btn-normal mr-5 " +
              `${state.pages.length > 0 ? "" : "disabled"}`
            }
            onClick={rotateSelectedPagesToRight}
          >
            <ArrowClockwise />
          </button>
          <button
            ref={deleteBtn}
            className={`btn btn-normal mr-5 ${
              state.selectedPages.length > 0 ? "" : "disabled"
            } `}
            onClick={deleteSelectedPages}
          >
            <Trash />
          </button>
        </div>
      </div>
      <div className="container">
        <div className="toolbox__wrapper d-flex">
          <div className="w-100">
            {mountedRef.current && (
              <DndProvider
                backend={isMobile ? TouchBackend : HTML5Backend}
                options={isMobile ? opts : null}
              >
                <div
                  className="previewer_content d-flex flex-wrap"
                  id="previewer_content"
                >
                  <PageDragLayer />
                  {state.pages.map((page, i) => {
                    const insertLineOnLeft =
                      state.hoverIndex === i && state.insertIndex === i;
                    const insertLineOnRight =
                      state.hoverIndex === i && state.insertIndex === i + 1;
                    return (
                      <Page
                        key={"page-" + page.id}
                        id={page.id}
                        index={i}
                        order={page.order}
                        rotation={page.rotation}
                        content={page.content}
                        selectedPages={state.selectedPages}
                        rearrangePages={rearrangePages}
                        setInsertIndex={setInsertIndex}
                        onSelectionChange={
                          isMobile
                            ? handlePagesSelectionOnMobile
                            : handlePagesSelection
                        }
                        clearPageSelection={clearPageSelection}
                        insertLineOnLeft={insertLineOnLeft}
                        insertLineOnRight={insertLineOnRight}
                        isSelected={state.selectedPages.includes(page)}
                      />
                    );
                  })}
                </div>
              </DndProvider>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export default Home;
