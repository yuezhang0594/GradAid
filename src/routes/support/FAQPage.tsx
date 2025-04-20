import { PageWrapper } from "@/components/ui/page-wrapper";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_AI_CREDITS, RESET_TIME_IN_DAYS } from "#/validators";
import { useNavigate } from "react-router-dom";

export default function FAQPage() {
    const navigate = useNavigate();

    return (
        <PageWrapper
            title="Frequently Asked Questions"
            description="Find answers to common questions about using GradAid for your graduate school applications."
        >
            {/* General Questions */}
            <Accordion type="single" collapsible className="w-full">
                <h2 className="text-xl text-start font-semibold mt-8 mb-4">General</h2>
                <Separator />
                <AccordionItem value="what-is-gradaid">
                    <AccordionTrigger>What is GradAid?</AccordionTrigger>
                    <AccordionContent>
                        GradAid is an AI-driven service that helps international students draft documentation required for US graduate school applications. We provide tools to create personalized Statements of Purpose (SOPs), Letters of Recommendation (LORs), and other application materials tailored to your unique background and aspirations.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="who-is-gradaid-for">
                    <AccordionTrigger>Who is GradAid for?</AccordionTrigger>
                    <AccordionContent>
                        GradAid is designed specifically for international students planning to attend graduate school in the US. Whether you're a current student looking to pursue advanced studies, a professional seeking to pivot into a new field, or someone with unique circumstances navigating the complex US application process, GradAid provides the tools you need to create compelling application materials.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-gradaid-helps">
                    <AccordionTrigger>
                        How can GradAid help with my graduate school applications?
                    </AccordionTrigger>
                    <AccordionContent>
                        GradAid helps by providing AI-powered document creation, university program search, application tracking, and deadline management. We assist with drafting SOPs and LORs that highlight your strengths and align with program requirements, all while maintaining your authentic voice. Unlike expensive consultancies, GradAid is available 24/7 at a fraction of the cost.
                    </AccordionContent>
                </AccordionItem>

                {/* Documents & Generation */}
                <h2 className="text-xl text-start font-semibold mt-8 mb-4">Documents & Generation</h2>
                <Separator />
                <AccordionItem value="document-types">
                    <AccordionTrigger>
                        What types of documents can I create with GradAid?
                    </AccordionTrigger>
                    <AccordionContent>
                        With GradAid, you can create various application documents including:
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Statements of Purpose (SOPs)</li>
                            <li>Letters of Recommendation (LORs)</li>
                        </ul>
                        Each document type is optimized for graduate school applications and can be customized for different programs.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-to-create-documents">
                    <AccordionTrigger>
                        How do I create documents using GradAid?
                    </AccordionTrigger>
                    <AccordionContent>
                        To create documents, you must first <span
                        className="text-blue-500 font-medium cursor-pointer hover:underline"
                        onClick={() => navigate('/apply')}
                        >start an application</span> to a graduate program. When you create an application, you can select the types of documents you want to generate. View your documents in the <span 
                            className="text-blue-500 font-medium cursor-pointer hover:underline"
                            onClick={() => navigate('/documents')}
                        >
                            Documents
                        </span> tab of your application. From there, you can use our AI-powered tools to draft your SOPs and LORs.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai-generation">
                    <AccordionTrigger>
                        How does the AI document generation work?
                    </AccordionTrigger>
                    <AccordionContent>
                        Our AI document generation works by analyzing information you provide about your background, experiences, skills, and career goals. The system uses this information along with knowledge about specific university program requirements to create personalized documents that highlight your unique qualifications and fit for each program. You provide the key details about yourself through our interactive forms, and our AI crafts a compelling narrative that showcases your strengths.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="edit-documents">
                    <AccordionTrigger>
                        Can I edit documents after they're generated?
                    </AccordionTrigger>
                    <AccordionContent>
                        Absolutely! All generated documents are fully editable. We encourage you to review and personalize the AI-generated content to ensure it accurately represents your voice and experiences. Our rich text editor allows you to make changes and refine your documents until they perfectly capture your story and aspirations.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="plagiarism">
                    <AccordionTrigger>
                        Are the generated documents plagiarism-free?
                    </AccordionTrigger>
                    <AccordionContent>
                        Yes, all documents generated by GradAid are original and plagiarism-free. Our AI creates unique content based on the information you provide rather than copying from existing sources. Each document is personalized to your specific background and tailored to the requirements of your target programs, ensuring authenticity and originality in your application materials.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai-credits">
                    <AccordionTrigger>
                        How do I get more AI credits for document generation?
                    </AccordionTrigger>
                    <AccordionContent>
                        Each GradAid member gets {DEFAULT_AI_CREDITS} AI credits that can be used for document generation. You can use these credits to create and edit documents as needed. If you run out of credits, you must wait until you receive additional credits every {RESET_TIME_IN_DAYS} days.
                    </AccordionContent>
                </AccordionItem>

                {/* University Applications */}
                <h2 className="text-xl text-start font-semibold mt-8 mb-4">University Applications</h2>
                <Separator />
                <AccordionItem value="start-application">
                    <AccordionTrigger>
                        Why can I not start an application?
                    </AccordionTrigger>
                    <AccordionContent>
                        In order to start an application to a university program, you must first save the program using the <span 
                            className="text-blue-500 font-medium cursor-pointer hover:underline"
                            onClick={() => navigate('/search')}
                        >
                            Program Search
                        </span> tool. Once you have saved a program, you can create an application for it by viewing it in the <span 
                            className="text-blue-500 font-medium cursor-pointer hover:underline"
                            onClick={() => navigate('/search')}
                        >
                            Saved Programs
                        </span> page or selecting it on the <span 
                            className="text-blue-500 font-medium cursor-pointer hover:underline"
                            onClick={() => navigate('/apply')}
                        >
                            Apply
                        </span> page. This process ensures that we have all the necessary information about the program when generating your application materials.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="track-applications">
                    <AccordionTrigger>
                        Can I track my applications through GradAid?
                    </AccordionTrigger>
                    <AccordionContent>
                        Yes, GradAid includes a comprehensive application tracking system. You can track the status of each application, set reminders for important deadlines, manage document requirements, and keep notes about each program. This feature helps you stay organized throughout the application process and ensures you never miss a deadline.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="university-info">
                    <AccordionTrigger>
                        Does GradAid provide information about universities?
                    </AccordionTrigger>
                    <AccordionContent>
                        Yes, GradAid includes a database of US universities and their graduate programs. You can search for programs based on location, field of study, ranking, and other criteria. Each university profile includes key information to help you make informed decisions about where to apply. If you don't see a specific program, you can add it to our database through an interactive form.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="program-deadlines">
                    <AccordionTrigger>
                        How do I find program deadlines?
                    </AccordionTrigger>
                    <AccordionContent>
                        Program deadlines are available in our university database. Simply search for your desired universities and programs to view their application deadlines. Additionally, our application tracking system automatically incorporates these deadlines and can send you reminders as important dates approach to ensure you submit all materials on time. You may also set custom deadlines for your applications to help you stay organized.
                    </AccordionContent>
                </AccordionItem>

                {/* Account & Privacy */}
                <h2 className="text-xl text-start font-semibold mt-8 mb-4">Account & Privacy</h2>
                <Separator />
                <AccordionItem value="data-security">
                    <AccordionTrigger>Is my data secure?</AccordionTrigger>
                    <AccordionContent>
                        Yes, data security is a top priority at GradAid. We use industry-standard encryption for data both in transit and at rest. Your personal information and documents are protected with secure authentication systems, and we maintain strict data protection policies. We only share your information for the purpose of AI document generation.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="delete-data">
                    <AccordionTrigger>Can I delete my data?</AccordionTrigger>
                    <AccordionContent>
                        Yes, you have full control over your data. You can delete individual documents, application records, or your entire account at any time through your account settings. When you request account deletion, all your personal information and documents are permanently removed from our systems in accordance with our privacy policy.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="access-materials">
                    <AccordionTrigger>
                        Who has access to my application materials?
                    </AccordionTrigger>
                    <AccordionContent>
                        Only you have access to your application materials. Your documents and personal information are private and visible only to your account. We do not share or sell your application materials under any circumstances.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </PageWrapper >
    );
}
