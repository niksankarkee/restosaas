'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { api } from '@/lib/api';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  Users,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

// Types for the new structure
interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  coursePrice: number;
  originalPrice?: number;
  numberOfItems: number;
  stayTime: number;
  courseContent: string;
  precautions: string;
  createdAt: string;
  updatedAt: string;
}

interface Menu {
  id: string;
  name: string;
  shortDesc: string;
  imageUrl: string;
  price: number;
  type: 'DRINK' | 'FOOD';
  mealType: 'LUNCH' | 'DINNER' | 'BOTH';
  createdAt: string;
  updatedAt: string;
}

type TabType = 'courses' | 'menus' | 'drinks' | 'lunch' | 'dinner';

function MenusPageContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] =
    useState(false);
  const [isCreateMenuDialogOpen, setIsCreateMenuDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [isEditMenuDialogOpen, setIsEditMenuDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      // Fetch courses and menus in parallel
      const [coursesResponse, menusResponse] = await Promise.all([
        api.get(`/owner/restaurants/${restaurantId}/courses`),
        api.get(`/owner/restaurants/${restaurantId}/menus`),
      ]);

      setCourses(coursesResponse.data.courses || []);
      setMenus(menusResponse.data.menus || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setCourses([]);
      setMenus([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (data: any) => {
    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      const response = await api.post(
        `/owner/restaurants/${restaurantId}/courses`,
        data
      );
      setCourses((prev) => [...prev, response.data]);
      setIsCreateCourseDialogOpen(false);
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const handleCreateMenu = async (data: any) => {
    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      const response = await api.post(
        `/owner/restaurants/${restaurantId}/menus`,
        data
      );
      setMenus((prev) => [...prev, response.data]);
      setIsCreateMenuDialogOpen(false);
    } catch (error) {
      console.error('Failed to create menu:', error);
    }
  };

  const handleUpdateCourse = async (data: any) => {
    if (!editingCourse) return;

    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      const response = await api.put(
        `/owner/restaurants/${restaurantId}/courses/${editingCourse.id}`,
        data
      );
      setCourses((prev) =>
        prev.map((c) => (c.id === editingCourse.id ? response.data : c))
      );
      setIsEditCourseDialogOpen(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleUpdateMenu = async (data: any) => {
    if (!editingMenu) return;

    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      const response = await api.put(
        `/owner/restaurants/${restaurantId}/menus/${editingMenu.id}`,
        data
      );
      setMenus((prev) =>
        prev.map((m) => (m.id === editingMenu.id ? response.data : m))
      );
      setIsEditMenuDialogOpen(false);
      setEditingMenu(null);
    } catch (error) {
      console.error('Failed to update menu:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      await api.delete(
        `/owner/restaurants/${restaurantId}/courses/${courseId}`
      );
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      await api.delete(`/owner/restaurants/${restaurantId}/menus/${menuId}`);
      setMenus((prev) => prev.filter((m) => m.id !== menuId));
    } catch (error) {
      console.error('Failed to delete menu:', error);
    }
  };

  const getFilteredMenus = () => {
    switch (activeTab) {
      case 'drinks':
        return menus.filter((menu) => menu.type === 'DRINK');
      case 'lunch':
        return menus.filter(
          (menu) => menu.mealType === 'LUNCH' || menu.mealType === 'BOTH'
        );
      case 'dinner':
        return menus.filter(
          (menu) => menu.mealType === 'DINNER' || menu.mealType === 'BOTH'
        );
      case 'menus':
        return menus;
      default:
        return [];
    }
  };

  const formatPrice = (price: number) => {
    return `Rs ${price}`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='h-64 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Menu & Course Management
            </h1>
            <p className='text-gray-600 mt-2'>
              Manage your restaurant menus and courses separately
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
        >
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='courses'>Courses</TabsTrigger>
            <TabsTrigger value='menus'>Menus</TabsTrigger>
            <TabsTrigger value='drinks'>Drinks</TabsTrigger>
            <TabsTrigger value='lunch'>Lunch</TabsTrigger>
            <TabsTrigger value='dinner'>Dinner</TabsTrigger>
          </TabsList>

          <TabsContent value='courses' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Courses</h2>
              <Dialog
                open={isCreateCourseDialogOpen}
                onOpenChange={setIsCreateCourseDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Course
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                  </DialogHeader>
                  <CourseForm
                    onSubmit={handleCreateCourse}
                    onCancel={() => setIsCreateCourseDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {courses.length === 0 ? (
              <Card>
                <CardContent className='text-center py-12'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No courses found
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Get started by creating your first course.
                  </p>
                  <Button onClick={() => setIsCreateCourseDialogOpen(true)}>
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {courses.map((course) => (
                  <Card key={course.id} className='overflow-hidden'>
                    {course.imageUrl && (
                      <div className='aspect-video overflow-hidden'>
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>
                          {course.title}
                        </CardTitle>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setEditingCourse(course);
                              setIsEditCourseDialogOpen(true);
                            }}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-sm text-gray-600'>
                        <div className='flex items-center gap-1'>
                          <DollarSign className='w-4 h-4' />
                          <span
                            className={
                              course.originalPrice ? 'line-through' : ''
                            }
                          >
                            {formatPrice(course.coursePrice)}
                          </span>
                          {course.originalPrice && (
                            <span className='text-green-600 font-semibold'>
                              {formatPrice(course.originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-1'>
                          <Users className='w-4 h-4' />
                          <span>{course.numberOfItems} items</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Clock className='w-4 h-4' />
                          <span>{formatTime(course.stayTime)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-gray-600 text-sm mb-3'>
                        {course.description}
                      </p>
                      <div className='flex gap-2'>
                        <Link href={`/owner-dashboard/courses/${course.id}`}>
                          <Button variant='outline' size='sm'>
                            <Eye className='w-4 h-4 mr-2' />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='menus' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>All Menu Items</h2>
              <Dialog
                open={isCreateMenuDialogOpen}
                onOpenChange={setIsCreateMenuDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Menu Item</DialogTitle>
                  </DialogHeader>
                  <MenuForm
                    onSubmit={handleCreateMenu}
                    onCancel={() => setIsCreateMenuDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {menus.length === 0 ? (
              <Card>
                <CardContent className='text-center py-12'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No menu items found
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Get started by creating your first menu item.
                  </p>
                  <Button onClick={() => setIsCreateMenuDialogOpen(true)}>
                    Create Menu Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {menus.map((menu) => (
                  <Card key={menu.id} className='overflow-hidden'>
                    {menu.imageUrl && (
                      <div className='aspect-video overflow-hidden'>
                        <img
                          src={menu.imageUrl}
                          alt={menu.name}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>{menu.name}</CardTitle>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setEditingMenu(menu);
                              setIsEditMenuDialogOpen(true);
                            }}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteMenu(menu.id)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={
                            menu.type === 'DRINK' ? 'default' : 'secondary'
                          }
                        >
                          {menu.type}
                        </Badge>
                        <Badge variant='outline'>{menu.mealType}</Badge>
                        <span className='text-lg font-semibold text-green-600'>
                          {formatPrice(menu.price)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-gray-600 text-sm'>{menu.shortDesc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='drinks' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Drinks</h2>
              <Dialog
                open={isCreateMenuDialogOpen}
                onOpenChange={setIsCreateMenuDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Drink
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Drink</DialogTitle>
                  </DialogHeader>
                  <MenuForm
                    onSubmit={handleCreateMenu}
                    onCancel={() => setIsCreateMenuDialogOpen(false)}
                    defaultType='DRINK'
                  />
                </DialogContent>
              </Dialog>
            </div>

            {getFilteredMenus().length === 0 ? (
              <Card>
                <CardContent className='text-center py-12'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No drinks found
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Get started by creating your first drink.
                  </p>
                  <Button onClick={() => setIsCreateMenuDialogOpen(true)}>
                    Create Drink
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {getFilteredMenus().map((menu) => (
                  <Card key={menu.id} className='overflow-hidden'>
                    {menu.imageUrl && (
                      <div className='aspect-video overflow-hidden'>
                        <img
                          src={menu.imageUrl}
                          alt={menu.name}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>{menu.name}</CardTitle>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setEditingMenu(menu);
                              setIsEditMenuDialogOpen(true);
                            }}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteMenu(menu.id)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>{menu.mealType}</Badge>
                        <span className='text-lg font-semibold text-green-600'>
                          {formatPrice(menu.price)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-gray-600 text-sm'>{menu.shortDesc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='lunch' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Lunch Menu</h2>
              <Dialog
                open={isCreateMenuDialogOpen}
                onOpenChange={setIsCreateMenuDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Lunch Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Lunch Item</DialogTitle>
                  </DialogHeader>
                  <MenuForm
                    onSubmit={handleCreateMenu}
                    onCancel={() => setIsCreateMenuDialogOpen(false)}
                    defaultMealType='LUNCH'
                  />
                </DialogContent>
              </Dialog>
            </div>

            {getFilteredMenus().length === 0 ? (
              <Card>
                <CardContent className='text-center py-12'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No lunch items found
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Get started by creating your first lunch item.
                  </p>
                  <Button onClick={() => setIsCreateMenuDialogOpen(true)}>
                    Create Lunch Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {getFilteredMenus().map((menu) => (
                  <Card key={menu.id} className='overflow-hidden'>
                    {menu.imageUrl && (
                      <div className='aspect-video overflow-hidden'>
                        <img
                          src={menu.imageUrl}
                          alt={menu.name}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>{menu.name}</CardTitle>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setEditingMenu(menu);
                              setIsEditMenuDialogOpen(true);
                            }}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteMenu(menu.id)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={
                            menu.type === 'DRINK' ? 'default' : 'secondary'
                          }
                        >
                          {menu.type}
                        </Badge>
                        <span className='text-lg font-semibold text-green-600'>
                          {formatPrice(menu.price)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-gray-600 text-sm'>{menu.shortDesc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='dinner' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Dinner Menu</h2>
              <Dialog
                open={isCreateMenuDialogOpen}
                onOpenChange={setIsCreateMenuDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Dinner Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Dinner Item</DialogTitle>
                  </DialogHeader>
                  <MenuForm
                    onSubmit={handleCreateMenu}
                    onCancel={() => setIsCreateMenuDialogOpen(false)}
                    defaultMealType='DINNER'
                  />
                </DialogContent>
              </Dialog>
            </div>

            {getFilteredMenus().length === 0 ? (
              <Card>
                <CardContent className='text-center py-12'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No dinner items found
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Get started by creating your first dinner item.
                  </p>
                  <Button onClick={() => setIsCreateMenuDialogOpen(true)}>
                    Create Dinner Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {getFilteredMenus().map((menu) => (
                  <Card key={menu.id} className='overflow-hidden'>
                    {menu.imageUrl && (
                      <div className='aspect-video overflow-hidden'>
                        <img
                          src={menu.imageUrl}
                          alt={menu.name}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>{menu.name}</CardTitle>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setEditingMenu(menu);
                              setIsEditMenuDialogOpen(true);
                            }}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteMenu(menu.id)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={
                            menu.type === 'DRINK' ? 'default' : 'secondary'
                          }
                        >
                          {menu.type}
                        </Badge>
                        <span className='text-lg font-semibold text-green-600'>
                          {formatPrice(menu.price)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-gray-600 text-sm'>{menu.shortDesc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Course Dialog */}
        <Dialog
          open={isEditCourseDialogOpen}
          onOpenChange={setIsEditCourseDialogOpen}
        >
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            {editingCourse && (
              <CourseForm
                initialData={editingCourse}
                onSubmit={handleUpdateCourse}
                onCancel={() => {
                  setIsEditCourseDialogOpen(false);
                  setEditingCourse(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Menu Dialog */}
        <Dialog
          open={isEditMenuDialogOpen}
          onOpenChange={setIsEditMenuDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
            {editingMenu && (
              <MenuForm
                initialData={editingMenu}
                onSubmit={handleUpdateMenu}
                onCancel={() => {
                  setIsEditMenuDialogOpen(false);
                  setEditingMenu(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function MenusPage() {
  return <MenusPageContent />;
}

// Course Form Component
function CourseForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Course;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    coursePrice: initialData?.coursePrice || 0,
    originalPrice: initialData?.originalPrice || '',
    numberOfItems: initialData?.numberOfItems || 1,
    stayTime: initialData?.stayTime || 60,
    courseContent: initialData?.courseContent || '',
    precautions: initialData?.precautions || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      coursePrice: Math.round(formData.coursePrice * 100), // Convert to cents and round
      originalPrice: formData.originalPrice
        ? Math.round(parseFloat(String(formData.originalPrice)) * 100)
        : null,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Course Title *
          </label>
          <input
            type='text'
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Image URL
          </label>
          <input
            type='url'
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='https://example.com/image.jpg'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Course Price (Rs) *
          </label>
          <input
            type='number'
            step='0.01'
            value={formData.coursePrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                coursePrice: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Original Price (Rs)
          </label>
          <input
            type='number'
            step='0.01'
            value={formData.originalPrice}
            onChange={(e) =>
              setFormData({ ...formData, originalPrice: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='For strikethrough pricing'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Number of Items *
          </label>
          <input
            type='number'
            min='1'
            value={formData.numberOfItems}
            onChange={(e) =>
              setFormData({
                ...formData,
                numberOfItems: parseInt(e.target.value) || 1,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Stay Time (minutes) *
        </label>
        <input
          type='number'
          min='1'
          value={formData.stayTime}
          onChange={(e) =>
            setFormData({
              ...formData,
              stayTime: parseInt(e.target.value) || 60,
            })
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Course Content (Rich Text)
        </label>
        <RichTextEditor
          value={formData.courseContent}
          onChange={(value) =>
            setFormData({ ...formData, courseContent: value })
          }
          placeholder='Detailed course content with rich text formatting...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Precautions
        </label>
        <textarea
          value={formData.precautions}
          onChange={(e) =>
            setFormData({ ...formData, precautions: e.target.value })
          }
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Any precautions or special notes...'
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>
          {initialData ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
}

// Menu Form Component
function MenuForm({
  initialData,
  onSubmit,
  onCancel,
  defaultType,
  defaultMealType,
}: {
  initialData?: Menu;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  defaultType?: 'DRINK' | 'FOOD';
  defaultMealType?: 'LUNCH' | 'DINNER' | 'BOTH';
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    shortDesc: initialData?.shortDesc || '',
    imageUrl: initialData?.imageUrl || '',
    price: initialData?.price ? initialData.price / 100 : 0,
    type: initialData?.type || defaultType || 'FOOD',
    mealType: initialData?.mealType || defaultMealType || 'BOTH',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: Math.round(formData.price * 100), // Convert to cents and round
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Name *
          </label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Image URL
          </label>
          <input
            type='url'
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='https://example.com/image.jpg'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Short Description
        </label>
        <textarea
          value={formData.shortDesc}
          onChange={(e) =>
            setFormData({ ...formData, shortDesc: e.target.value })
          }
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Price (Rs) *
          </label>
          <input
            type='number'
            step='0.01'
            value={formData.price}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as 'DRINK' | 'FOOD',
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          >
            <option value='FOOD'>Food</option>
            <option value='DRINK'>Drink</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Meal Type *
          </label>
          <select
            value={formData.mealType}
            onChange={(e) =>
              setFormData({
                ...formData,
                mealType: e.target.value as 'LUNCH' | 'DINNER' | 'BOTH',
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          >
            <option value='LUNCH'>Lunch</option>
            <option value='DINNER'>Dinner</option>
            <option value='BOTH'>Both</option>
          </select>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>
          {initialData ? 'Update Menu Item' : 'Create Menu Item'}
        </Button>
      </div>
    </form>
  );
}
