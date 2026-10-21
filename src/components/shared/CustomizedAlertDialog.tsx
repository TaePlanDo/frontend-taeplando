import { useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ButtonCustomized } from "@/components/shared/ButtonCustomized";

type CustomizedAlertDialogProps = {
  trigger: ReactNode;
  title: string;
  message: string;
  submitText?: string;
  cancelText?: string;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
};

export function CustomizedAlertDialog({
  trigger,
  title,
  message,
  submitText = "Usuń",
  cancelText = "Anuluj",
  onSubmit,
  onCancel,
}: CustomizedAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!onSubmit) {
      setOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    onCancel?.();
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="border-foreground/10 bg-background text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/70 text-lg py-4">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <ButtonCustomized
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-32 px-6"
          >
            {cancelText}
          </ButtonCustomized>
          <ButtonCustomized
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-32 rounded-4xl px-6"
          >
            {submitText}
          </ButtonCustomized>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
