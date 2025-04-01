import { Alert } from "react-bootstrap";
export const StatusMessage = ({ statusMessage, color, children }) => {
  if (!statusMessage) return null;
  return (
    <Alert variant={color} className="my-3">
      {statusMessage} {children}
    </Alert>
  );
};
