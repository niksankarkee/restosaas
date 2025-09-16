'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface Course {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface Menu {
  id: string;
  title: string;
  description: string;
  courses: Course[];
}

interface MenuFormData {
  title: string;
  description: string;
}

function MenusPageContent() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      const response = await api.get(
        `/owner/restaurants/${restaurantId}/menus`
      );
      setMenus(response.data);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenu = async (data: MenuFormData) => {
    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      const response = await api.post(
        `/owner/restaurants/${restaurantId}/menus`,
        data
      );
      setMenus((prev) => [...prev, response.data]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create menu:', error);
    }
  };

  const handleCreateCourse = async (data: any) => {
    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      const response = await api.post(
        `/owner/restaurants/${restaurantId}/menus/${selectedMenuId}/courses`,
        data
      );

      // Update the specific menu with the new course
      setMenus((prevMenus) =>
        prevMenus.map((menu) =>
          menu.id === selectedMenuId
            ? { ...menu, courses: [...menu.courses, response.data] }
            : menu
        )
      );
      setIsCourseDialogOpen(false);
      setSelectedMenuId(null);
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='max-w-6xl mx-auto'>
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
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Menu Management
            </h1>
            <p className='text-gray-600 mt-2'>
              Manage your restaurant menus and courses
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Create Menu</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Menu</DialogTitle>
              </DialogHeader>
              <MenuForm
                onSubmit={handleCreateMenu}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {menus.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No menus found
              </h3>
              <p className='text-gray-600 mb-4'>
                Get started by creating your first menu.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Menu
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6'>
            {menus.map((menu) => (
              <Card key={menu.id}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-xl'>{menu.title}</CardTitle>
                      {menu.description && (
                        <p className='text-gray-600 mt-1'>{menu.description}</p>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setSelectedMenuId(menu.id);
                          setIsCourseDialogOpen(true);
                        }}
                      >
                        Add Course
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setEditingMenu(menu);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {menu.courses && menu.courses.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {menu.courses.map((course) => (
                        <div
                          key={course.id}
                          className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <h4 className='font-semibold text-gray-900'>
                              {course.name}
                            </h4>
                            <span className='text-lg font-bold text-green-600'>
                              ${course.price}
                            </span>
                          </div>
                          {course.imageUrl && (
                            <img
                              src={course.imageUrl}
                              alt={course.name}
                              className='w-full h-32 object-cover rounded mb-2'
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-gray-500 text-center py-4'>
                      No courses in this menu yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Course Dialog */}
        <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Course to Menu</DialogTitle>
            </DialogHeader>
            <CourseForm
              onSubmit={handleCreateCourse}
              onCancel={() => setIsCourseDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Menu Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu</DialogTitle>
            </DialogHeader>
            {editingMenu && (
              <MenuForm
                initialData={editingMenu}
                onSubmit={(data) => {
                  // Handle edit logic here
                  setIsEditDialogOpen(false);
                }}
                onCancel={() => setIsEditDialogOpen(false)}
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

// Menu Form Component
function MenuForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: MenuFormData;
  onSubmit: (data: MenuFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<MenuFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='title'>Menu Title</Label>
        <Input
          id='title'
          type='text'
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>
      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>Create Menu</Button>
      </div>
    </form>
  );
}

// Course Form Component
function CourseForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    imageUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='name'>Course Name</Label>
        <Input
          id='name'
          type='text'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor='price'>Price</Label>
        <Input
          id='price'
          type='number'
          step='0.01'
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor='imageUrl'>Image URL (Optional)</Label>
        <Input
          id='imageUrl'
          type='url'
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          placeholder='https://example.com/image.jpg'
        />
      </div>
      <div className='flex gap-2'>
        <Button type='submit'>Add Course</Button>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
