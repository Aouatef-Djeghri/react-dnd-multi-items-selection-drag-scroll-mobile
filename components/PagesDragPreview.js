import React from "react";
import PageContent from "./PageContent";
const PagesDragPreview = React.memo(function PagesDragPreview({ pages }) {
  let backPreviews = 1;
  if (pages.length === 2) {
    backPreviews = 2;
  } else if (pages.length >= 3) {
    backPreviews = 3;
  }

  return (
    <div>
      {pages.slice(0, backPreviews).map((page, i) => (
        <div
          key={page.id}
          style={{
            zIndex: pages.length - i,
            transform: `rotateZ(${-i * 2.5}deg)`,
            height: "0px",
            width: "0px",
          }}
        >
          <PageContent content={page.content} />
        </div>
      ))}
    </div>
  );
});

export default PagesDragPreview;
