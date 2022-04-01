import React from "react";

const PageContent = React.memo(function PageContent(props) {
  return (
    <div>
      <div>
        <div className="page-content">
          <h2>{props.content}</h2>
        </div>
      </div>
    </div>
  );
});
export default PageContent;
