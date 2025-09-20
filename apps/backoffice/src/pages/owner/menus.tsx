import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@restosaas/ui';
import { Input } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { Badge } from '../../components/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/dialog';
import { RichTextEditor } from '../../components/rich-text-editor';
import { api as apiClient } from '../../lib/api-client';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Utensils,
  DollarSign,
  Clock,
  Users,
  Eye,
} from 'lucide-react';
import type {
  Menu,
  Course,
  CreateMenuRequest,
  CreateCourseRequest,
  UpdateMenuRequest,
  UpdateCourseRequest,
  MenuResponse,
  CourseResponse,
  RestaurantResponse,
} from '@restosaas/types';

type TabType = 'courses' | 'menus' | 'drinks' | 'lunch' | 'dinner';

export function OwnerMenus() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [isCreateMenuDialogOpen, setIsCreateMenuDialogOpen] = useState(false);
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] =
    useState(false);
  const [isEditMenuDialogOpen, setIsEditMenuDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuResponse | null>(null);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(
    null
  );
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const queryClient = useQueryClient();

  // Get restaurants first
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['owner-restaurants'],
    queryFn: () => apiClient.getMyRestaurants(),
  });

  // Get menus for selected restaurant
  const { data: menus, isLoading: menusLoading } = useQuery({
    queryKey: ['owner-menus', selectedRestaurantId],
    queryFn: () => apiClient.getOwnerRestaurantMenus(selectedRestaurantId),
    enabled: !!selectedRestaurantId,
  });

  // Get courses for selected restaurant
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['owner-courses', selectedRestaurantId],
    queryFn: () => apiClient.getOwnerRestaurantCourses(selectedRestaurantId),
    enabled: !!selectedRestaurantId,
  });

  // Set first restaurant as default
  useEffect(() => {
    if (
      restaurants?.data?.restaurants &&
      restaurants.data.restaurants.length > 0 &&
      !selectedRestaurantId
    ) {
      setSelectedRestaurantId(restaurants.data.restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  const createMenuMutation = useMutation({
    mutationFn: (data: CreateMenuRequest) =>
      apiClient.createMenu(selectedRestaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owner-menus', selectedRestaurantId],
      });
      setIsCreateMenuDialogOpen(false);
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: CreateCourseRequest) =>
      apiClient.createCourse(selectedRestaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owner-courses', selectedRestaurantId],
      });
      setIsCreateCourseDialogOpen(false);
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuRequest }) =>
      apiClient.updateMenu(selectedRestaurantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owner-menus', selectedRestaurantId],
      });
      setIsEditMenuDialogOpen(false);
      setEditingMenu(null);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseRequest }) =>
      apiClient.updateCourse(selectedRestaurantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owner-courses', selectedRestaurantId],
      });
      setIsEditCourseDialogOpen(false);
      setEditingCourse(null);
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteMenu(selectedRestaurantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owner-menus', selectedRestaurantId],
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.deleteCourse(selectedRestaurantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owner-courses', selectedRestaurantId],
      });
    },
  });

  const getFilteredMenus = () => {
    if (!menus?.data?.menus) return [];

    const filtered = menus.data.menus.filter((menu: MenuResponse) =>
      menu.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (activeTab) {
      case 'drinks':
        return filtered.filter((menu: MenuResponse) => menu.type === 'DRINK');
      case 'lunch':
        return filtered.filter(
          (menu: MenuResponse) =>
            menu.mealType === 'LUNCH' || menu.mealType === 'BOTH'
        );
      case 'dinner':
        return filtered.filter(
          (menu: MenuResponse) =>
            menu.mealType === 'DINNER' || menu.mealType === 'BOTH'
        );
      case 'menus':
        return filtered;
      default:
        return [];
    }
  };

  const filteredMenus = getFilteredMenus();
  const filteredCourses =
    courses?.data?.courses?.filter((course: CourseResponse) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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

  if (restaurantsLoading) {
    return <div>Loading...</div>;
  }

  if (
    !restaurants?.data?.restaurants ||
    restaurants.data.restaurants.length === 0
  ) {
    return (
      <div className='text-center py-12'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          No restaurants found
        </h3>
        <p className='text-gray-600 mb-4'>
          You need to create a restaurant first before managing menus.
        </p>
        <Button onClick={() => (window.location.href = '/owner/restaurants')}>
          Go to Restaurants
        </Button>
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

        {/* Restaurant Selector */}
        <div className='flex items-center space-x-4 mb-6'>
          <label className='text-sm font-medium text-gray-700'>
            Restaurant:
          </label>
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            {restaurants?.data?.restaurants?.map(
              (restaurant: RestaurantResponse) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name} - {restaurant.place}
                </option>
              )
            )}
          </select>
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
                    onSubmit={(data) => createCourseMutation.mutate(data)}
                    onCancel={() => setIsCreateCourseDialogOpen(false)}
                    isLoading={createCourseMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {coursesLoading ? (
              <div className='animate-pulse'>
                <div className='h-64 bg-gray-200 rounded'></div>
              </div>
            ) : filteredCourses.length === 0 ? (
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
                {filteredCourses.map((course: CourseResponse) => (
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
                            onClick={() => {
                              if (
                                confirm(
                                  'Are you sure you want to delete this course?'
                                )
                              ) {
                                deleteCourseMutation.mutate(course.id);
                              }
                            }}
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
                        <Button variant='outline' size='sm'>
                          <Eye className='w-4 h-4 mr-2' />
                          View Details
                        </Button>
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
                    onSubmit={(data) => createMenuMutation.mutate(data)}
                    onCancel={() => setIsCreateMenuDialogOpen(false)}
                    isLoading={createMenuMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {menusLoading ? (
              <div className='animate-pulse'>
                <div className='h-64 bg-gray-200 rounded'></div>
              </div>
            ) : filteredMenus.length === 0 ? (
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
                {filteredMenus.map((menu: MenuResponse) => (
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
                            onClick={() => {
                              if (
                                confirm(
                                  'Are you sure you want to delete this menu item?'
                                )
                              ) {
                                deleteMenuMutation.mutate(menu.id);
                              }
                            }}
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
                    onSubmit={(data) => createMenuMutation.mutate(data)}
                    onCancel={() => setIsCreateMenuDialogOpen(false)}
                    isLoading={createMenuMutation.isPending}
                    defaultType='DRINK'
                  />
                </DialogContent>
              </Dialog>
            </div>

            {filteredMenus.length === 0 ? (
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
                {filteredMenus.map((menu: MenuResponse) => (
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
                            onClick={() => {
                              if (
                                confirm(
                                  'Are you sure you want to delete this menu item?'
                                )
                              ) {
                                deleteMenuMutation.mutate(menu.id);
                              }
                            }}
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
                    onSubmit={(data) => createMenuMutation.mutate(data)}
                    onCancel={() => setIsCreateMenuDialogOpen(false)}
                    isLoading={createMenuMutation.isPending}
                    defaultMealType='LUNCH'
                  />
                </DialogContent>
              </Dialog>
            </div>

            {filteredMenus.length === 0 ? (
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
                {filteredMenus.map((menu: MenuResponse) => (
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
                            onClick={() => {
                              if (
                                confirm(
                                  'Are you sure you want to delete this menu item?'
                                )
                              ) {
                                deleteMenuMutation.mutate(menu.id);
                              }
                            }}
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
                    onSubmit={(data) => createMenuMutation.mutate(data)}
                    onCancel={() => setIsCreateMenuDialogOpen(false)}
                    isLoading={createMenuMutation.isPending}
                    defaultMealType='DINNER'
                  />
                </DialogContent>
              </Dialog>
            </div>

            {filteredMenus.length === 0 ? (
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
                {filteredMenus.map((menu: MenuResponse) => (
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
                            onClick={() => {
                              if (
                                confirm(
                                  'Are you sure you want to delete this menu item?'
                                )
                              ) {
                                deleteMenuMutation.mutate(menu.id);
                              }
                            }}
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
                onSubmit={(data) =>
                  updateCourseMutation.mutate({ id: editingCourse.id, data })
                }
                onCancel={() => {
                  setIsEditCourseDialogOpen(false);
                  setEditingCourse(null);
                }}
                isLoading={updateCourseMutation.isPending}
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
                onSubmit={(data) =>
                  updateMenuMutation.mutate({ id: editingMenu.id, data })
                }
                onCancel={() => {
                  setIsEditMenuDialogOpen(false);
                  setEditingMenu(null);
                }}
                isLoading={updateMenuMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Course Form Component
function CourseForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: CourseResponse;
  onSubmit: (data: CreateCourseRequest | UpdateCourseRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
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
        : undefined,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 p-6'>
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
        <Button type='submit' disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : initialData
            ? 'Update Course'
            : 'Create Course'}
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
  isLoading,
  defaultType,
  defaultMealType,
}: {
  initialData?: MenuResponse;
  onSubmit: (data: CreateMenuRequest | UpdateMenuRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
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
    <form onSubmit={handleSubmit} className='space-y-4 p-6'>
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
        <Button type='submit' disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : initialData
            ? 'Update Menu Item'
            : 'Create Menu Item'}
        </Button>
      </div>
    </form>
  );
}
