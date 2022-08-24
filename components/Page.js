import React, { useRef, useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import { isMobile } from "react-device-detect";
import PageContent from "./PageContent";

const Page = React.memo(function Card(props) {
  const ref = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [{ isDragging }, drag, preview] = useDrag({
    type: "page",
    item: () => {
      const { id, order, content, rotation, index } = props;
      const draggedPage = { id, order, content, rotation };
      let pages;
      if (props.selectedPages.find((page) => page.id === props.id)) {
        pages = props.selectedPages;
      } else {
        props.clearPageSelection();
        props.onSelectionChange(index, null);

        pages = [draggedPage];
      }
      const otherPages = pages.concat();
      otherPages.splice(
        pages.findIndex((c) => c.id === props.id),
        1
      );
      const pagesDragStack = [draggedPage, ...otherPages];
      const pagesIDs = pages.map((c) => c.id);
      return { pages, pagesDragStack, draggedPage, pagesIDs };
    },
    isDragging: (monitor) => {
      return monitor.getItem().pagesIDs.includes(props.id);
    },
    end: (item) => {
      props.rearrangePages(item);
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ hovered }, drop] = useDrop({
    accept: "page",
    hover: (item, monitor) => {
      const dragIndex = item.draggedPage.index;
      const hoverIndex = props.index;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get horizontal middle
      const midX =
        hoverBoundingRect.left +
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      // Determine mouse position
      const pointerOffset = monitor.getClientOffset();

      const newInsertIndex =
        pointerOffset.x < midX ? hoverIndex : hoverIndex + 1;
      props.setInsertIndex(dragIndex, hoverIndex, newInsertIndex);

      //Add scroll in mobile
      if (isMobile) {
        if (monitor.getDifferenceFromInitialOffset().y > 0) {
          //finger moving down
          document.body.scrollTop = document.body.scrollTop + 2;
        }
        if (monitor.getDifferenceFromInitialOffset().y < 0) {
          //finger moving up
          document.body.scrollTop = document.body.scrollTop - 3;
        }
      }
    },
    collect: (monitor) => ({
      hovered: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  const onClick = (e) => {
    props.onSelectionChange(props.index, e.ctrlKey);
  };

  useEffect(() => {
    preview(getEmptyImage(), {
      captureDraggingState: true,
    });
  }, []);

  const opacity = isDragging ? 0.4 : 1;

  const borderLeft =
    props.insertLineOnLeft && hovered ? "2px solid #8d4688" : null;

  const borderRight =
    props.insertLineOnRight && hovered ? "2px solid #8d4688" : null;

  return (
    <div
      className={`preview ${props.isSelected ? "selected" : ""}`}
      ref={ref}
      onClick={onClick}
      style={{ opacity, borderLeft, borderRight }}
      id={props.id}
      data-id={props.id}
      data-index={props.index}
      data-page-rotation={props.rotation}
      data-page-number="1"
    >
      <PageContent content={props.content} />
    </div>
  );
});

export default Page;
