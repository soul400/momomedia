import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Media, Supporter, insertMediaSchema, insertSupporterSchema } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Footer } from "@/components/layout/footer";
import { FileUpload } from "@/components/ui/file-upload";
import { MediaCard } from "@/components/media-card";
import { SupporterCard } from "@/components/supporter-card";
import { Trash2, PlusCircle, ImagePlus, VideoIcon, Users } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define form schemas
const mediaFormSchema = z.object({
  title: z.string().min(3, { message: "العنوان يجب أن يكون 3 أحرف على الأقل" }),
  description: z.string().optional(),
  year: z.coerce.number().min(2024).max(2026),
  month: z.coerce.number().min(1).max(12),
  isFeatured: z.boolean().default(false),
  duration: z.string().optional(),
  mediaType: z.enum(["video", "image"]),
});

const supporterFormSchema = z.object({
  name: z.string().min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" }),
  supportAmount: z.coerce.number().min(1, { message: "قيمة الدعم يجب أن تكون أكبر من 0" }),
  rank: z.coerce.number().min(1, { message: "الترتيب يجب أن يكون 1 أو أكبر" }),
  year: z.coerce.number().min(2024).max(2026),
  month: z.coerce.number().min(1).max(12),
  avatarUrl: z.string().optional(),
});

type MediaFormValues = z.infer<typeof mediaFormSchema>;
type SupporterFormValues = z.infer<typeof supporterFormSchema>;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("upload-media");
  const { toast } = useToast();
  
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Sidebar - hidden on mobile */}
        <Sidebar className="hidden lg:block" />
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Menu */}
          <MobileMenu className="lg:hidden" />
          
          {/* Main Content Area */}
          <main className="p-6">
            <h1 className="text-3xl font-bold mb-6">لوحة الإدارة</h1>
            
            <Tabs 
              defaultValue="upload-media" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mb-10"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="upload-media" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>رفع محتوى</span>
                </TabsTrigger>
                <TabsTrigger value="manage-media" className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4" />
                  <span>إدارة المحتوى</span>
                </TabsTrigger>
                <TabsTrigger value="manage-supporters" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>إدارة الداعمين</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload-media">
                <UploadMediaForm onSuccess={() => toast({ title: "تم رفع المحتوى بنجاح" })} />
              </TabsContent>
              
              <TabsContent value="manage-media">
                <ManageMediaContent />
              </TabsContent>
              
              <TabsContent value="manage-supporters">
                <ManageSupporters />
              </TabsContent>
            </Tabs>
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

function UploadMediaForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  
  const form = useForm<MediaFormValues>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      isFeatured: false,
      duration: "",
      mediaType: "video",
    },
  });
  
  // Handle media upload
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/media", {
        method: "POST",
        credentials: "include",
        body: data,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل الرفع: ${errorText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      form.reset();
      setMediaFile(null);
      setThumbnailFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/media/featured"] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "فشل في رفع المحتوى",
        description: error.message,
      });
    },
  });
  
  const onSubmit = (values: MediaFormValues) => {
    if (!mediaFile) {
      toast({
        variant: "destructive",
        title: "خطأ في الملف",
        description: "يرجى اختيار ملف للرفع",
      });
      return;
    }
    
    const formData = new FormData();
    
    // Add form values
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    // Add files
    formData.append("media", mediaFile);
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }
    
    uploadMutation.mutate(formData);
  };
  
  // Update media type when file changes
  const handleMediaFileChange = (file: File | null) => {
    setMediaFile(file);
    if (file) {
      const newType = file.type.startsWith("image/") ? "image" : "video";
      setMediaType(newType);
      form.setValue("mediaType", newType);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>رفع محتوى جديد</CardTitle>
        <CardDescription>
          يمكنك رفع مقاطع فيديو أو صور للأرشيف
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان المحتوى</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل عنوان المحتوى" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أدخل وصف المحتوى" 
                          rows={4}
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السنة</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر السنة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الشهر</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الشهر" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }).map((_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {getMonthName(i + 1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {mediaType === "video" && (
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مدة الفيديو</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="مثال: 12:34" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          أدخل المدة بصيغة دقائق:ثواني
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-reverse space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>محتوى مميز</FormLabel>
                        <FormDescription>
                          سيظهر هذا المحتوى في قسم المحتوى المميز
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="mediaType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع المحتوى</FormLabel>
                      <Select 
                        onValueChange={(value: "video" | "image") => {
                          field.onChange(value);
                          setMediaType(value);
                        }}
                        value={mediaType}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع المحتوى" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">فيديو</SelectItem>
                          <SelectItem value="image">صورة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>ملف {mediaType === "video" ? "الفيديو" : "الصورة"}</FormLabel>
                  <FileUpload
                    accept={mediaType === "video" ? "video/*" : "image/*"}
                    fileType={mediaType}
                    onChange={handleMediaFileChange}
                    value={mediaFile}
                    label={mediaType === "video" ? "اختر ملف فيديو أو اسحبه هنا" : "اختر ملف صورة أو اسحبه هنا"}
                    className="mb-4"
                  />
                </div>
                
                {mediaType === "video" && (
                  <div>
                    <FormLabel>صورة مصغرة (اختياري)</FormLabel>
                    <FileUpload
                      accept="image/*"
                      fileType="image"
                      onChange={setThumbnailFile}
                      value={thumbnailFile}
                      label="اختر صورة مصغرة أو اسحبها هنا"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={uploadMutation.isPending}
                className="min-w-[120px]"
              >
                {uploadMutation.isPending ? "جاري الرفع..." : "رفع المحتوى"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ManageMediaContent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  
  // Fetch all media
  const { data: allMedia, isLoading } = useQuery<Media[]>({
    queryKey: ["/api/media"],
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/media/featured"] });
      toast({
        title: "تم حذف المحتوى بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "فشل في حذف المحتوى",
        description: error.message,
      });
    }
  });
  
  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => {
      await apiRequest("PUT", `/api/media/${id}`, { isFeatured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/media/featured"] });
      toast({
        title: "تم تحديث حالة المحتوى المميز",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "فشل في تحديث حالة المحتوى المميز",
        description: error.message,
      });
    }
  });
  
  // Filter media
  const filteredMedia = allMedia 
    ? allMedia.filter(media => {
        const matchesSearch = searchTerm === "" || 
          media.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (media.description && media.description.toLowerCase().includes(searchTerm.toLowerCase()));
          
        const matchesYear = filterYear === null || media.year === filterYear;
        const matchesMonth = filterMonth === null || media.month === filterMonth;
        
        return matchesSearch && matchesYear && matchesMonth;
      })
    : [];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إدارة المحتوى</CardTitle>
          <CardDescription>
            عرض وإدارة جميع مقاطع الفيديو والصور في الأرشيف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="ابحث عن محتوى..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Select
                onValueChange={(value) => setFilterYear(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="السنة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                onValueChange={(value) => setFilterMonth(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="الشهر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {getMonthName(i + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                  <div className="bg-muted h-40 rounded-md mb-4"></div>
                  <div className="bg-muted h-5 w-3/4 rounded-md mb-2"></div>
                  <div className="bg-muted h-4 w-full rounded-md"></div>
                </div>
              ))}
            </div>
          ) : filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedia.map((media) => (
                <Card key={media.id} className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={media.thumbnailUrl || media.fileUrl} 
                      alt={media.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-background/80 rounded-md px-2 py-1 text-xs">
                      {media.mediaType === "video" ? "فيديو" : "صورة"}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-1 line-clamp-1">{media.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {media.description || "بدون وصف"}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span>
                        {getMonthName(media.month)} {media.year}
                      </span>
                      <span>{media.views} مشاهدة</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="flex items-center">
                      <Checkbox
                        id={`featured-${media.id}`}
                        checked={media.isFeatured}
                        onCheckedChange={(checked) => {
                          toggleFeaturedMutation.mutate({
                            id: media.id,
                            isFeatured: checked === true
                          });
                        }}
                      />
                      <label
                        htmlFor={`featured-${media.id}`}
                        className="mr-2 text-sm"
                      >
                        محتوى مميز
                      </label>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من حذف هذا المحتوى؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيتم حذف المحتوى نهائيًا ولا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(media.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">لا يوجد محتوى</h3>
              <p className="text-muted-foreground">
                لا يوجد محتوى يطابق معايير البحث
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ManageSupporters() {
  const { toast } = useToast();
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
  
  // Fetch supporters
  const { 
    data: supporters, 
    isLoading 
  } = useQuery<Supporter[]>({
    queryKey: [`/api/supporters/top?year=${yearFilter}&month=${monthFilter}&limit=50`],
  });
  
  // Add supporter mutation
  const addSupporterMutation = useMutation({
    mutationFn: async (data: SupporterFormValues) => {
      const res = await apiRequest("POST", "/api/supporters", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/supporters/top?year=${yearFilter}&month=${monthFilter}&limit=50`] 
      });
      toast({
        title: "تم إضافة الداعم بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "فشل في إضافة الداعم",
        description: error.message,
      });
    }
  });
  
  // Delete supporter mutation
  const deleteSupporterMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/supporters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/supporters/top?year=${yearFilter}&month=${monthFilter}&limit=50`] 
      });
      toast({
        title: "تم حذف الداعم بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "فشل في حذف الداعم",
        description: error.message,
      });
    }
  });
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>إضافة داعم جديد</CardTitle>
          <CardDescription>
            أضف داعمين مميزين ليظهروا في قسم الداعمين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddSupporterForm onSubmit={(data) => addSupporterMutation.mutate(data)} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>إدارة الداعمين</CardTitle>
          <CardDescription>
            عرض وإدارة الداعمين المميزين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Select
              value={yearFilter.toString()}
              onValueChange={(value) => setYearFilter(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={monthFilter.toString()}
              onValueChange={(value) => setMonthFilter(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="الشهر" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {getMonthName(i + 1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                  <div className="bg-muted h-16 w-16 rounded-full mx-auto mb-3"></div>
                  <div className="bg-muted h-5 w-20 mx-auto rounded-md mb-2"></div>
                  <div className="bg-muted h-4 w-16 mx-auto rounded-md"></div>
                </div>
              ))}
            </div>
          ) : supporters && supporters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {supporters.map((supporter) => (
                <Card key={supporter.id} className="relative">
                  <CardContent className="p-4 text-center">
                    <div className="absolute top-2 right-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-7 w-7">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد من حذف هذا الداعم؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف بيانات الداعم نهائيًا.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSupporterMutation.mutate(supporter.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <div className="mb-3 mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                      <img 
                        src={supporter.avatarUrl || `https://i.pravatar.cc/150?u=${supporter.id}`}
                        alt={supporter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <h3 className="font-medium mb-1">{supporter.name}</h3>
                    <p className="text-sm text-accent mb-2">
                      الداعم رقم {supporter.rank}
                    </p>
                    <div className="text-xs bg-primary/20 text-primary rounded-full px-2 py-1 inline-flex items-center">
                      <span>{supporter.supportAmount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">لا يوجد داعمين</h3>
              <p className="text-muted-foreground">
                لا يوجد داعمين لهذا الشهر
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddSupporterForm({ onSubmit }: { onSubmit: (data: SupporterFormValues) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SupporterFormValues>({
    resolver: zodResolver(supporterFormSchema),
    defaultValues: {
      name: "",
      supportAmount: 0,
      rank: 1,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      avatarUrl: "",
    },
  });
  
  const handleSubmit = (values: SupporterFormValues) => {
    setIsSubmitting(true);
    onSubmit(values);
    form.reset();
    setIsSubmitting(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الداعم</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم الداعم" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط الصورة (اختياري)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/avatar.jpg" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  رابط لصورة الداعم (سيتم استخدام صورة افتراضية إذا لم يتم تحديد رابط)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="supportAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>قيمة الدعم</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="أدخل قيمة الدعم" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الترتيب</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="أدخل ترتيب الداعم" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  ترتيب الداعم (1 للأول، 2 للثاني، وهكذا)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السنة</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر السنة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الشهر</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الشهر" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {getMonthName(i + 1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الإضافة..." : "إضافة داعم"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Helper function to get Arabic month name
function getMonthName(month: number): string {
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  
  return months[month - 1];
}
