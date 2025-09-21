import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  maxHeight = 'max-h-96'
}) => {
  // Handle escape key press
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Size variants
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Animation variants
  const overlayVariants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -50,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`
              relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]}
              ${maxHeight} overflow-hidden
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-xl font-semibold text-gray-900"
                  >
                    {title}
                  </h2>
                )}
                
                {showCloseButton && (
                  <motion.button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={`overflow-y-auto ${maxHeight === 'max-h-96' ? 'max-h-96' : maxHeight}`}>
              <div className={title || showCloseButton ? 'p-6' : 'p-6'}>
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Confirmation Modal variant
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'btn-primary',
  cancelButtonClass = 'btn-secondary',
  isLoading = false
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <motion.button
            onClick={onClose}
            disabled={isLoading}
            className={`${cancelButtonClass} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {cancelText}
          </motion.button>
          
          <motion.button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${confirmButtonClass} flex items-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

// Alert Modal variant
export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  type = 'info',
  buttonText = 'OK'
}) => {
  const typeStyles = {
    info: {
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    success: {
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      buttonClass: 'bg-green-600 hover:bg-green-700 text-white'
    },
    warning: {
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    error: {
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
    }
  };

  const style = typeStyles[type];

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      showCloseButton={false}
    >
      <div className="text-center space-y-4">
        <div className={`w-12 h-12 mx-auto ${style.bgColor} rounded-full flex items-center justify-center`}>
          <div className={style.iconColor}>
            {getIcon()}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        
        <motion.button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${style.buttonClass}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {buttonText}
        </motion.button>
      </div>
    </Modal>
  );
};

export default Modal;