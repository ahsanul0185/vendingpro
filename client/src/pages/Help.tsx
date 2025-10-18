import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, Mail, Phone, MessageSquare, FileText, Video, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Help() {
  const { toast } = useToast();

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Support ticket submitted",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="p-8" data-testid="help-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HelpCircle className="h-8 w-8" />
          Help & Support
        </h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions or get in touch with our support team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Documentation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse our comprehensive guides and documentation
            </p>
            <Button variant="outline" className="w-full" data-testid="button-documentation">
              <BookOpen className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <CardTitle>Video Tutorials</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Watch step-by-step video guides for common tasks
            </p>
            <Button variant="outline" className="w-full" data-testid="button-tutorials">
              <Video className="h-4 w-4 mr-2" />
              Watch Tutorials
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Live Chat</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Chat with our support team in real-time
            </p>
            <Button variant="outline" className="w-full" data-testid="button-live-chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger data-testid="faq-add-machine">
                  How do I add a new vending machine?
                </AccordionTrigger>
                <AccordionContent>
                  Navigate to the Monitoring page and click the "Add Machine" button. Fill in the machine details
                  including name, location, and initial stock level. The machine will appear in your dashboard
                  immediately after creation.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger data-testid="faq-track-orders">
                  How do I track orders from my machines?
                </AccordionTrigger>
                <AccordionContent>
                  Go to the Orders page to view all transactions from your vending machines. You can filter orders
                  by status, date range, or machine location. Click on any order to view detailed information including
                  items purchased and payment method.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger data-testid="faq-schedule-maintenance">
                  How do I schedule maintenance for a machine?
                </AccordionTrigger>
                <AccordionContent>
                  Visit the Maintenance page and click "Schedule Maintenance". Select the machine, maintenance type,
                  priority level, and scheduled date. You can assign a technician and add notes about the maintenance
                  task. You'll receive notifications when maintenance is due.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger data-testid="faq-manage-inventory">
                  How do I manage product inventory?
                </AccordionTrigger>
                <AccordionContent>
                  The Products page allows you to add, edit, and delete products. You can set prices, stock levels,
                  categories, and upload product images. Use the filters to quickly find specific products. Stock
                  levels are automatically updated when orders are placed.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger data-testid="faq-create-delivery">
                  How do I create a delivery to restock machines?
                </AccordionTrigger>
                <AccordionContent>
                  Go to the Deliveries page and click "Create Delivery". Select the destination machine, add the items
                  to be delivered, and assign a driver. You can track the delivery status and add notes. The machine's
                  stock level will be updated automatically when the delivery is marked as completed.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Ticket</CardTitle>
            <CardDescription>Can't find what you're looking for? Contact us directly</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-subject">Subject</Label>
                <Input
                  id="ticket-subject"
                  placeholder="Brief description of your issue"
                  required
                  data-testid="input-ticket-subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-email">Email Address</Label>
                <Input
                  id="ticket-email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  data-testid="input-ticket-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-message">Message</Label>
                <Textarea
                  id="ticket-message"
                  placeholder="Describe your issue in detail..."
                  className="min-h-[150px]"
                  required
                  data-testid="input-ticket-message"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit-ticket">
                <Mail className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Other ways to reach our support team</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Email Support</h4>
              <p className="text-sm text-muted-foreground">support@vendingpro.com</p>
              <p className="text-xs text-muted-foreground mt-1">Response time: Within 24 hours</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Phone Support</h4>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground mt-1">Mon-Fri: 9am-6pm EST</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
