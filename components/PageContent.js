import React from "react";

const PageContent = React.memo(function PageContent(props) {
  return (
    <div className="page-content">
      <h2>{props.content}</h2>
    </div>
  );
});
export default PageContent;
