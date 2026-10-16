
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import "../styles/Pagination.css";

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <Button
        className="page-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={18} />
      </Button>

      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <Button
            key={page}
            className={`page-button ${
              currentPage === page ? "active" : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}

      <Button
        className="page-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}

export default Pagination;
