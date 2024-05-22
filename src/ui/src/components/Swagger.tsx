import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

interface Props {
  project: string;
  version: string;
}

const SwaggerUIComponent = ({ project, version }: Props) => {
  return (
    <div style={{ height: "100vh" }}>
      <SwaggerUI
        url={`/docs/yml/${project}-${version}.yml`}
        docExpansion="none"
        defaultModelsExpandDepth={-1}
        defaultModelExpandDepth={2}
        displayOperationId={true}
      />
    </div>
  );
};

export default SwaggerUIComponent;
