<header class="bg-red-500 text-white p-4 border-b-4 border-red-700">
    <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-3xl font-bold tracking-tight">GitKnights</h1>
        <nav>
            <ul class="flex space-x-4">
                <li><a href="./" class="hover:text-yellow-300">Home</a></li>
                <li><a href="./about" class="hover:text-yellow-300">About</a></li>
                <li><a href="./login" class="hover:text-yellow-300">Play</a></li>
                <li><a href="./credit" class="hover:text-yellow-300">Credit</a></li>
            </ul>
        </nav>
    </div>
</header>

<slot></slot>

<footer class="bg-gray-800 text-white text-center py-4">
    <p>&copy; 2024 GitKnights. All rights reserved.</p>
</footer>