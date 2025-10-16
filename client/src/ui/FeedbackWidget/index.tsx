import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from 'react-redux';
import selectors from '../../selectors';

interface FeedbackWidgetProps {
  widget?: string;
  apiUrl: string;
  widgetPath: string;
  channel: string;
}

export function FeedbackWidget({
  widget = "feedback",
  apiUrl,
  widgetPath,
  channel,
}: FeedbackWidgetProps) {
  const { t } = useTranslation();
  const currentUser = useSelector((state) => selectors.selectCurrentUser(state));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLoggedIn = useSelector((state: any) => selectors.selectCurrentUserId(state)) !== null;

  const title: string = t("feedback_widget.title");
  const placeholder: string = t("feedback_widget.placeholder");
  const emailPlaceholder: string = t("feedback_widget.email_placeholder");
  const submitText: string = t("feedback_widget.submit_text");
  const successText: string = t("feedback_widget.success_text");
  const successText2: string = t("feedback_widget.success_text2");
  const closeLabel: string = t("feedback_widget.close_label");

  useEffect(() => {
    if (!channel || !apiUrl || !widgetPath) return;

    // Initialize the widget array if it doesn't exist
    if (typeof window !== "undefined" && widgetPath) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)._stmsg_widget = (window as any)._stmsg_widget || [];

      // Construct script URLs from the base path
      const loaderScript = `${widgetPath}loader.js`;
      const feedbackScript = `${widgetPath}feedback.js`;

      // Push the widget configuration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)._stmsg_widget.push([
        "loader",
        "init",
        {
          params: {
            title,
            api: apiUrl,
            channel,
            placeholder,
            emailPlaceholder,
            submitText,
            successText,
            successText2,
            closeLabel,
            // Add email parameter if user is logged in
            ...(isLoggedIn && { email: currentUser?.email }),
          },
          script: feedbackScript,
          widget,
          label: title,
          closeLabel,
        },
      ]);

      // Load the loader script if not already loaded
      if (!document.querySelector(`script[src="${loaderScript}"]`)) {
        const script = document.createElement("script");
        script.async = true;
        script.src = loaderScript;
        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        }
      }
    }
  }, [title, channel, apiUrl, widgetPath, widget, emailPlaceholder, submitText, successText, successText2, isLoggedIn, currentUser]);

  // This component doesn't render anything visible
  // The widget is injected via the script
  return null;
}
